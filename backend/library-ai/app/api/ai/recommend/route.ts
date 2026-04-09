import { NextRequest } from 'next/server'
import { createServerClient } from '../../../lib/supabase'
import { getCurrentUserWithRole } from '../../../lib/auth'
import { ok, handleApiError } from '../../../lib/utils'
import {
  grokComplete,
  GROK_SMART,
  buildSystemPrompt,
  parseGrokJson,
  type UserContext,
} from '../../../lib/grok'
import type { Book, BorrowRecord, Order, UserProfile } from '../../../lib/types'

const CACHE_TTL_MS = 60 * 60 * 1000

interface GrokRecommendation {
  book_id: string
  reason: string
  score: number
}

export const dynamic = 'force-dynamic'

export async function POST(_req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole()
    const supabase = await createServerClient()

    const { data: cached } = await supabase
      .from('ai_recommendations_cache')
      .select('book_ids, reason, expires_at')
      .eq('user_id', user.id)
      .single()

    if (cached && new Date(cached.expires_at) > new Date()) {
      const { data: books } = await supabase
        .from('books')
        .select('*')
        .in('id', cached.book_ids as string[])

      return ok({
        books: (books ?? []) as Book[],
        reason: cached.reason,
        cached: true,
        expires_at: cached.expires_at,
      })
    }

    const { data: borrows } = await supabase
      .from('borrows')
      .select('book_id, status')
      .eq('user_id', user.id)
      .order('borrowed_at', { ascending: false })
      .limit(30)

    const { data: orders } = await supabase
      .from('orders')
      .select('id, status')
      .eq('user_id', user.id)
      .limit(20)

    const { data: cart } = await supabase
      .from('carts')
      .select('items:cart_items(book_id)')
      .eq('user_id', user.id)
      .single()

    const cartBookIds = ((cart?.items as Array<{ book_id: string }>) ?? []).map((i) => i.book_id)

    const alreadyHasIds = [
      ...(borrows ?? []).map((b: Pick<BorrowRecord, 'book_id' | 'status'>) => b.book_id),
      ...cartBookIds,
    ]

    const borrowedIds = (borrows ?? []).map((b: Pick<BorrowRecord, 'book_id'>) => b.book_id).slice(0, 15)
    let recentBooks: Pick<Book, 'id' | 'title' | 'author' | 'genres'>[] = []
    if (borrowedIds.length) {
      const { data } = await supabase
        .from('books')
        .select('id, title, author, genres')
        .in('id', borrowedIds)
      recentBooks = (data ?? []) as typeof recentBooks
    }

    let candidateQuery = supabase
      .from('books')
      .select('id, title, author, genres, price, is_for_sale, available, ai_summary')
      .order('purchase_count', { ascending: false })
      .limit(60)

    if (alreadyHasIds.length) {
      candidateQuery = candidateQuery.not('id', 'in', `(${alreadyHasIds.join(',')})`)
    }

    const { data: candidates } = await candidateQuery

    if (!candidates?.length) {
      return ok({ books: [], reason: 'No new books to recommend yet.', cached: false })
    }

    const userCtx: UserContext = {
      profile: user.profile as UserProfile,
      borrows: (borrows ?? []) as Pick<BorrowRecord, 'book_id' | 'status'>[],
      orders: (orders ?? []) as Pick<Order, 'id' | 'status'>[],
      cartBookIds,
      recentBooks,
    }

    const candidateSummary = candidates
      .slice(0, 30)
      .map((b: typeof candidates[number]) => `ID:${b.id} | "${b.title}" by ${b.author} | ${b.genres?.join(',')} | KES ${b.price}`)
      .join('\n')

    const raw = await grokComplete({
      model: GROK_SMART,
      maxTokens: 800,
      temperature: 0.5,
      systemPrompt: buildSystemPrompt('recommender', userCtx),
      prompt: `Based on the user's reading history above, pick the 6 best books from this list:

${candidateSummary}

Return ONLY this JSON (use exact book IDs from the list):
{
  "recommendations": [
    { "book_id": "uuid", "reason": "one sentence why", "score": 0.95 }
  ],
  "summary": "One sentence explaining the overall recommendation strategy"
}`,
    })

    let recs: GrokRecommendation[] = []
    let summary = 'Personalised picks based on your reading history.'

    try {
      const parsed = parseGrokJson<{
        recommendations: GrokRecommendation[]
        summary: string
      }>(raw)
      recs = parsed.recommendations ?? []
      summary = parsed.summary ?? summary
    } catch {
      recs = candidates.slice(0, 6).map((b: typeof candidates[number], i: number) => ({
        book_id: b.id,
        reason: 'Popular in our library',
        score: 1 - i * 0.05,
      }))
    }

    const recommendedIds = recs.map((r) => r.book_id)

    const { data: books } = await supabase
      .from('books')
      .select('*')
      .in('id', recommendedIds)

    const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString()

    await supabase
      .from('ai_recommendations_cache')
      .upsert(
        {
          user_id: user.id,
          book_ids: recommendedIds,
          reason: summary,
          expires_at: expiresAt,
        },
        { onConflict: 'user_id' }
      )

    return ok({
      books: (books ?? []) as Book[],
      reason: summary,
      recs,
      cached: false,
      expires_at: expiresAt,
    })
  } catch (err) {
    return handleApiError(err)
  }
}