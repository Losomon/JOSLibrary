/**
 * app/api/orders/route.ts
 *
 * GET  /api/orders  — authenticated user's orders (with items)
 * POST /api/orders  — create order from current cart (snapshots price_at_purchase)
 */

import { NextRequest } from 'next/server'
import { createServerClient } from '../../lib/supabase'
import { getCurrentUserWithRole } from '../../lib/auth'
import {
  ok,
  created,
  handleApiError,
  parseBody,
  assertPurchasable,
  generateOrderNumber,
  DELIVERY_FEE_KES,
} from '../../lib/utils'
import { DeliveryAddressSchema } from '../../lib/types'
import { NotFoundError, ValidationError } from '../../lib/errors'
import { z } from 'zod'
import type { Order } from '../../lib/types'

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/orders
// ─────────────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole()
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          book:books(id, title, author, cover_url, isbn)
        ),
        delivery:deliveries(*),
        payments(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return ok(data as Order[])
  } catch (err) {
    return handleApiError(err)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/orders  — create order from cart
// ─────────────────────────────────────────────────────────────────────────────

const CreateOrderSchema = z.object({
  delivery_address: DeliveryAddressSchema,
})

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUserWithRole()
    const { delivery_address } = await parseBody(req, CreateOrderSchema)
    const supabase = await createServerClient()

    // 1. Fetch cart + items
    const { data: cart, error: cartError } = await supabase
      .from('carts')
      .select(`
        id,
        items:cart_items(
          id,
          quantity,
          price_at_add,
          book:books(id, title, price, is_for_sale, stock_quantity)
        )
      `)
      .eq('user_id', user.id)
      .single()

    if (cartError || !cart) throw new NotFoundError('Cart')

    const items = (cart.items ?? []) as Array<{
      id: string
      quantity: number
      price_at_add: number
      book: { id: string; title: string; price: number; is_for_sale: boolean; stock_quantity: number }
    }>

    if (items.length === 0) {
      throw new ValidationError('Your cart is empty')
    }

    // 2. Stock check for every item
    items.forEach(({ book, quantity }) => assertPurchasable(book, quantity))

    // 3. Calculate totals
    //    price_at_purchase = price_at_add (frozen when added to cart)
    //    This honours the price the customer saw, not the current price
    const subtotal = items.reduce(
      (sum, item) => sum + item.price_at_add * item.quantity,
      0
    )
    const total_amount = subtotal + DELIVERY_FEE_KES

    // 4. Create order (status = 'pending' until payment confirmed)
    const order_number = generateOrderNumber()

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        order_number,
        total_amount,
        status: 'pending',
        payment_method: null,
        delivery_fee: DELIVERY_FEE_KES,
        delivery_address,
      })
      .select()
      .single()

    if (orderError || !order) throw orderError ?? new Error('Failed to create order')

    // 5. Insert order items — snapshot price_at_purchase
    const orderItems = items.map((item) => ({
      order_id: order.id,
      book_id: item.book.id,
      quantity: item.quantity,
      price_at_purchase: item.price_at_add,  // ← frozen from cart
    }))

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)

    if (itemsError) throw itemsError

    // 6. Decrement stock for each book
    await Promise.all(
      items.map(({ book, quantity }) =>
        supabase
          .from('books')
          .update({ stock_quantity: book.stock_quantity - quantity })
          .eq('id', book.id)
      )
    )

    // 7. Fetch full order with items for response
    const { data: fullOrder, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        items:order_items(
          *,
          book:books(id, title, author, cover_url)
        )
      `)
      .eq('id', order.id)
      .single()

    if (fetchError) throw fetchError

    return created(
      fullOrder as Order,
      `Order ${order_number} created. Proceed to checkout to confirm payment.`
    )
  } catch (err) {
    return handleApiError(err)
  }
}