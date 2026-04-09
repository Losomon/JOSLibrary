/**
 * app/api/borrows/[id]/route.ts
 *
 * GET /api/borrows/[id] — Get a specific borrow by ID
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '../../../lib/supabase'
import { getCurrentUserWithRole } from '../../../lib/auth'
import { ok, handleApiError } from '../../../lib/utils'
import { NotFoundError, ForbiddenError } from '../../../lib/errors'
import type { BorrowRecord } from '../../../lib/types'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUserWithRole()
    const { id } = await params
    const supabase = await createServerClient()

    const isStaff = ['librarian', 'admin'].includes(user.profile.role)

    let query = supabase
      .from('borrows')
      .select(`
        *,
        book:books(id, title, author, cover_url)
      `)
      .eq('id', id)

    if (!isStaff) {
      query = query.eq('user_id', user.id)
    }

    const { data: borrow, error } = await query.single()

    if (error || !borrow) {
      throw new NotFoundError('Borrow record')
    }

    return ok(borrow as BorrowRecord)
  } catch (err) {
    return handleApiError(err)
  }
}