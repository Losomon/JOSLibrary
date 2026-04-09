/**
 * app/api/ai/search/route.ts
 *
 * POST /api/ai/search
 *   Natural language query → Grok parses intent → Supabase filtered query
 *
 * Example queries:
 *   "sci-fi books under 500 KES available to borrow"
 *   "novels by African authors with romance"
 *   "cheap programming books in stock"
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '../../../lib/supabase'
import { ok, handleApiError, parseBody } from '../../../lib/utils'
import { AiSearchQuerySchema } from '../../../lib/types'
import {
  getGrokClient,
  GROK_FAST,
  buildSystemPrompt,
  parseGrokJson,
} from '../../../lib/grok'
import type { Book } from '../../../lib/types'

// ─────────────────────────────────────────────────────────────────────────────
// PARSED FILTER SHAPE  (what Grok returns)
// ─────────────────────────────────────────────────────────────────────────────

interface ParsedFilters {
  keywords?:    string[]
  genres?:      string[]
  author?:      string
  maxPrice?:    number
  minPrice?:    number
  isForSale?:   boolean
  isAvailable?: boolean
  limit?:       number
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { query } = await parseBody(req, AiSearchQuerySchema)
    const supabase  = await createServerClient()

    // ── 1. Ask Grok to parse the NL query into filters ────────────────────────
    const grok = getGrokClient()

    const parserRes = await grok.chat.completions.create({
      model:       GROK_FAST,
      max_tokens:  300,
      temperature: 0,
      messages: [
        {
          role:    'system',
          content: buildSystemPrompt('search'),
        },
        {
          role:    'user',
          content: `Parse this book search query into filters:
"${query}"

Return ONLY this JSON shape (omit fields that don't apply):
{
  "keywords":    ["word1", "word2"],
  "genres":      ["fiction", "sci-fi"],
  "author":      "author name",
  "maxPrice":    500,
  "minPrice":    0,
  "isForSale":   true,
  "isAvailable": true,
  "limit":       20
}`,
        },
      ],
    })

    let filters: ParsedFilters = {}
    try {
      filters = parseGrokJson<ParsedFilters>(
        parserRes.choices[0]?.message?.content ?? '{}'
      )
    } catch {
      // If Grok returns unparseable JSON, fall back to keyword search
      filters = { keywords: query.split(' ').filter(Boolean) }
    }

    // ── 2. Build Supabase query from parsed filters ────────────────────────────
    let dbQuery = supabase
      .from('books')
      .select('*')
      .order('purchase_count', { ascending: false })
      .limit(filters.limit ?? 20)

    if (filters.genres?.length) {
      dbQuery = dbQuery.overlaps('genres', filters.genres)
    }

    if (filters.author) {
      dbQuery = dbQuery.ilike('author', `%${filters.author}%`)
    }

    if (filters.maxPrice !== undefined) {
      dbQuery = dbQuery.lte('price', filters.maxPrice)
    }

    if (filters.minPrice !== undefined) {
      dbQuery = dbQuery.gte('price', filters.minPrice)
    }

    if (filters.isForSale !== undefined) {
      dbQuery = dbQuery.eq('is_for_sale', filters.isForSale)
    }

    if (filters.isAvailable !== undefined) {
      dbQuery = dbQuery.eq('available', filters.isAvailable)
    }

    if (filters.keywords?.length) {
      const keywordSearch = filters.keywords
        .map((k) => `title.ilike.%${k}%,author.ilike.%${k}%,description.ilike.%${k}%,ai_tags.cs.{${k}}`)
        .join(',')
      dbQuery = dbQuery.or(keywordSearch)
    }

    const { data, error } = await dbQuery

    if (error) throw error

    return ok({
      books:          (data ?? []) as Book[],
      parsed_filters: filters,
      query,
    })
  } catch (err) {
    return handleApiError(err)
  }
}