/**
 * app/api/carts/route.ts
 *
 * GET  /api/carts        — get current user's cart with items
 * POST /api/carts        — add item to cart (snapshots price_at_add)
 * DELETE /api/carts      — clear entire cart
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '../../lib/supabase'
import { getCurrentUserWithRole } from '../../lib/auth'
import {
  ok,
  created,
  noContent,
  handleApiError,
  parseBody,
  assertPurchasable,
} from '../../lib/utils'
import { AddToCartSchema } from '../../lib/types'
import { NotFoundError, ConflictError } from '../../lib/errors'
import type { Cart } from '../../lib/types'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/carts
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole()
    const supabase = await createServerClient()

    const { data: cart, error } = await supabase
      .from('carts')
      .select(`
        *,
        items:cart_items(
          *,
          book:books(
            id, title, author, cover_url,
            price, is_for_sale, stock_quantity, available
          )
        )
      `)
      .eq('user_id', user.id)
      .single()

    // Cart doesn't exist yet — return empty cart shape
    if (error?.code === 'PGRST116' || !cart) {
      return ok({ id: null, user_id: user.id, items: [], created_at: null, updated_at: null })
    }

    if (error) throw error

    return ok(cart as Cart)
  } catch (err) {
    return handleApiError(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/carts  — add item (or increment quantity if already in cart)
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole()
    const { book_id, quantity } = await parseBody(req, AddToCartSchema)
    const supabase = await createServerClient()

    // 1. Fetch book + verify purchasable
    const { data: book, error: bookError } = await supabase
      .from('books')
      .select('id, title, price, is_for_sale, stock_quantity')
      .eq('id', book_id)
      .single()

    if (bookError || !book) throw new NotFoundError('Book')
    if (!book.is_for_sale || book.price === null) throw new NotFoundError('Book not available for purchase')
    assertPurchasable({ title: book.title, is_for_sale: !!book.is_for_sale, stock_quantity: book.stock_quantity ?? 0 }, quantity)

    // 2. Get or create cart (UPSERT — one cart per user enforced by DB UNIQUE)
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .upsert({ user_id: user.id }, { onConflict: 'user_id' })
      .select()
      .single()

    if (cartError || !cart) throw cartError ?? new Error('Failed to create cart')

    // 3. Check if this book is already in the cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cart.id)
      .eq('book_id', book_id)
      .single()

    let result

    if (existingItem) {
      // Increment quantity — but check stock again with new total
      const newQty = (existingItem.quantity ?? 0) + quantity
      if (!book.is_for_sale || book.price === null) throw new NotFoundError('Book not available for purchase')
      assertPurchasable({ title: book.title, is_for_sale: !!book.is_for_sale, stock_quantity: book.stock_quantity ?? 0 }, newQty)

      const { data, error } = await supabase
        .from('cart_items')
        .update({ quantity: newQty })
        .eq('id', existingItem.id)
        .select()
        .single()

      if (error) throw error
      result = data
    } else {
      // Insert new item — SNAPSHOT price_at_add at current book price
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          book_id,
          quantity,
          price_at_add: book.price,   // ← frozen at time of add
        })
        .select()
        .single()

      if (error) throw error
      result = data
    }

    // 4. Update cart timestamp
    await supabase
      .from('carts')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', cart.id)

    return created(result, `"${book.title}" added to cart`)
  } catch (err) {
    return handleApiError(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/carts  — clear entire cart
// ─────────────────────────────────────────────────────────────────────────────

export async function DELETE(_req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole()
    const supabase = await createServerClient()

    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cart) return noContent()

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('cart_id', cart.id)

    if (error) throw error

    return noContent()
  } catch (err) {
    return handleApiError(err)
  }
}