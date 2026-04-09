import { NextRequest } from 'next/server'
import { createServerClient } from '../../lib/supabase'
import { CreateBorrowSchema } from '../../lib/types'
import { parseBody, handleApiError, created } from '../../lib/utils'
import { getCurrentUserWithRole, requireRole } from '../../lib/auth'
import { assertBorrowLimit, assertBorrowable, getDueDate } from '../../lib/utils'
import { StockError, BorrowLimitError } from '../../lib/errors'
import type { BorrowStatus } from '../../lib/types'

export const dynamic = 'force-dynamic'

// GET /api/borrows - List all borrows (librarian sees all, member sees own)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    // Check auth - either librarian/admin can see all, or member sees own
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    let query = supabase
      .from('borrows')
      .select(`
        *,
        book:books(id, title, author, cover_url)
      `)
      .order('borrowed_at', { ascending: false })

    // If member, only show their own borrows
    if (profile?.role === 'member') {
      query = query.eq('user_id', user.id)
    }

    if (status && ['active', 'overdue', 'returned'].includes(status)) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ success: true, data: data ?? [] })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Auth: member only
    const user = await requireRole('member')

    const body = await parseBody(request, CreateBorrowSchema)
    const supabase = await createServerClient()

    // Fetch book
    const { data: book } = await supabase
      .from('books')
      .select('*, title, available, current_copies')
      .eq('id', body.book_id)
      .single()

    if (!book) {
      throw new StockError('Book not found', 0)
    }

    // Business rules
    assertBorrowable(book)
    
    // Check user's active borrows
    const { data: activeBorrowsRaw } = await supabase
      .from('borrows')
      .select('status')
      .eq('user_id', user.id)
      .in('status', ['active', 'overdue'])

    const activeBorrows = (activeBorrowsRaw ?? [])
      .filter(b => b.status === 'active' || b.status === 'overdue')
      .map(b => ({ status: b.status as BorrowStatus }))

    assertBorrowLimit(activeBorrows)

    // Create borrow record
    const borrowData = {
      user_id: user.id,
      book_id: body.book_id,
      borrowed_at: new Date().toISOString(),
      due_date: body.due_date || getDueDate(),
      status: 'active' as const,
      fine_amount: 0,
    }

    const { data: newBorrow, error } = await supabase
      .from('borrows')
      .insert(borrowData)
      .select(`
        *,
        book:books(title, author, current_copies)
      `)
      .single()

    if (error) throw error

    // Decrement book copies
    const currentCopies = book.current_copies ?? 0
    const newCopies = Math.max(0, currentCopies - 1)
    const newAvailable = newCopies > 0

    const { error: updateError } = await supabase
      .from('books')
      .update({ current_copies: newCopies, available: newAvailable })
      .eq('id', body.book_id)

    if (updateError) throw updateError

    return created(newBorrow, 'Book borrowed successfully')
  } catch (error) {
    return handleApiError(error)
  }
}
