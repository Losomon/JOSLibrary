/**
 * app/api/books/[id]/route.ts
 *
 * GET    /api/books/[id]  — single book (public)
 * PATCH  /api/books/[id]  — update book (librarian/admin only)
 * DELETE /api/books/[id]  — delete book (admin only)
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '../../../lib/supabase'
import { requireLibrarian, requireAdmin } from '../../../lib/auth'
import {
  ok,
  noContent,
  handleApiError,
  parseBody,
} from '../../../lib/utils'
import { UpdateBookSchema } from '../../../lib/types'
import { NotFoundError } from '../../../lib/errors'
import type { Book } from '../../../lib/types'

type RouteContext = { params: Promise<{ id: string }> }

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/books/[id]
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('books')
      .select('*, book_tags(tag)')
      .eq('id', id)
      .single()

    if (error || !data) throw new NotFoundError('Book')

    return ok(data as Book)
  } catch (err) {
    return handleApiError(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/books/[id]  (librarian/admin only)
// ─────────────────────────────────────────────────────────────────────────────

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireLibrarian()
    const { id } = await params
    const body = await parseBody(req, UpdateBookSchema)
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('books')
      .update(body)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) throw new NotFoundError('Book')

    return ok(data as Book, 'Book updated successfully')
  } catch (err) {
    return handleApiError(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/books/[id]  (admin only)
// ─────────────────────────────────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin()
    const { id } = await params
    const supabase = await createServerClient()

    const { error } = await supabase.from('books').delete().eq('id', id)

    if (error) throw error

    return noContent()
  } catch (err) {
    return handleApiError(err)
  }
}