import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '../../lib/supabase'
import { BookFiltersSchema, PaginatedResponse, CreateBookSchema, Book } from '../../lib/types'
import { parseSearchParams, parseBody, handleApiError, ok, created } from '../../lib/utils'

export const dynamic = 'force-dynamic'

// GET /api/books - List with pagination + filters
export async function GET(request: NextRequest) {
  try {
    const filters = parseSearchParams(request, BookFiltersSchema)
    
    const supabase = await createServerClient()
    
    // Build query
    let query = supabase
      .from('books')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Filters
    if (filters.genre) {
      query = query.ilike('genres', `%${filters.genre}%`)
    }
    if (filters.author) {
      query = query.ilike('author', `%${filters.author}%`)
    }
    if (filters.available !== undefined) {
      query = query.eq('available', filters.available)
    }
    if (filters.is_for_sale !== undefined) {
      query = query.eq('is_for_sale', filters.is_for_sale)
    }
    if (filters.min_price !== undefined) {
      query = query.gte('price', filters.min_price)
    }
    if (filters.max_price !== undefined) {
      query = query.lte('price', filters.max_price)
    }
    if (filters.search) {
      query = query.or(
        `title.ilike.%${filters.search}%,author.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      )
    }

    // Pagination
    const from = (filters.page - 1) * filters.limit
    const to = from + filters.limit - 1
    const { data, count, error } = await query.range(from, to)

    if (error) throw error

    const total = count ?? 0
    const totalPages = Math.ceil(total / filters.limit)

    const response: PaginatedResponse<Book> = {
      success: true,
      data: (data ?? []) as Book[],
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        total_pages: totalPages,
        has_next: filters.page < totalPages,
        has_prev: filters.page > 1,
      },
    }

    return ok(response, `Found ${data?.length ?? 0} books`)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/books - Create new book (librarian)
export async function POST(request: NextRequest) {
  try {
    const body = await parseBody(request, CreateBookSchema)
    const supabase = await createServerClient()

    // Auto-set available based on copies
    const available = (body.current_copies ?? 0) > 0

    const { data, error } = await supabase
      .from('books')
      .insert({ ...body, available })
      .select()
      .single()

    if (error) throw error

    // Fire-and-forget auto-tagging — does NOT block the response
    if (data) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
      fetch(`${appUrl}/api/books/tag`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ book_id: data.id }),
      }).catch((err) => console.error('[Auto-tag fire-and-forget failed]', err))
    }

    return created(data, 'Book created successfully')
  } catch (error) {
    return handleApiError(error)
  }
}

