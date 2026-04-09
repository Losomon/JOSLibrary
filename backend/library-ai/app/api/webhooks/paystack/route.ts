/**
 * app/api/webhooks/paystack/route.ts
 *
 * POST /api/webhooks/paystack
 *   Paystack calls this after charge.success / charge.failed events.
 *   Uses HMAC SHA-512 signature verification.
 *   Uses service_role client — bypasses RLS.
 *
 * Flow on charge.success:
 *   1. Verify HMAC signature
 *   2. Find order by payment_reference
 *   3. Verify amount matches
 *   4. Mark order "paid"
 *   5. Insert payments record
 *   6. Decrement stock
 *   7. Create delivery record
 *   8. Clear cart
 *   9. Audit log
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase'
import {
  verifyPaystackSignature,
  type PaystackWebhookEvent,
} from '../../../lib/payments/paystack'
import { getEstimatedDeliveryDate } from '../../../lib/utils'

export async function POST(req: NextRequest) {
  try {
    // ── 1. Read raw body for HMAC (must happen before .json()) ───────────────
    const rawBody  = await req.text()
    const signature = req.headers.get('x-paystack-signature')

    verifyPaystackSignature(rawBody, signature)

    const event = JSON.parse(rawBody) as PaystackWebhookEvent

    // Only handle successful charges
    if (event.event !== 'charge.success') {
      return NextResponse.json({ received: true })
    }

    const { reference, amount, paid_at, metadata } = event.data
    const orderId = metadata?.order_id as string | undefined

    if (!orderId) {
      console.error('[Paystack] No order_id in metadata for ref:', reference)
      return NextResponse.json({ received: true })
    }

    const supabase = createAdminClient()

    // ── 2. Find order ─────────────────────────────────────────────────────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, status')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      console.error('[Paystack] Order not found:', orderId)
      return NextResponse.json({ received: true })
    }

    // Idempotency
    if (order.status === 'paid') {
      return NextResponse.json({ received: true })
    }

    // ── 3. Verify amount (Paystack sends in kobo — divide by 100 for KES) ────
    const paidKES = amount / 100
    if (Math.abs(paidKES - order.total_amount) > 1) {
      console.error('[Paystack] Amount mismatch. Expected:', order.total_amount, 'Got:', paidKES)
      return NextResponse.json({ received: true })
    }

    // ── 4. Mark order paid ────────────────────────────────────────────────────
    await supabase
      .from('orders')
      .update({
        status:         'paid',
        paid_at:        paid_at ?? new Date().toISOString(),
        payment_method: 'card',
      })
      .eq('id', order.id)

    // ── 5. Insert payment record ──────────────────────────────────────────────
    await supabase.from('payments').insert({
      order_id:     order.id,
      amount:       paidKES,
      method:       'card',
      reference,
      status:       'success',
      raw_response: event as unknown as any,
    })

    // ── 6. Decrement stock ────────────────────────────────────────────────────
    const { data: orderItems } = await supabase
      .from('order_items')
      .select('book_id, quantity, book:books(stock_quantity)')
      .eq('order_id', order.id)

    if (orderItems) {
      await Promise.all(
        orderItems.map((item) => {
          const book = item.book as { stock_quantity: number | null } | null
          const newStock = (book?.stock_quantity ?? 0) - item.quantity
          return supabase
            .from('books')
            .update({ stock_quantity: Math.max(0, newStock) })
            .eq('id', item.book_id!)
        })
      )
    }

    // ── 7. Create delivery ────────────────────────────────────────────────────
    await supabase.from('deliveries').insert({
      order_id:                order.id,
      status:                  'preparing',
      estimated_delivery_date: getEstimatedDeliveryDate(2),
    })

    // ── 8. Clear cart ─────────────────────────────────────────────────────────
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', order.user_id!)
      .single()

    if (cart) {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id)
    }

    // ── 9. Audit log ──────────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      action:      'payment_confirmed',
      user_id:     order.user_id!,
      entity_type: 'order',
      entity_id:   order.id,
      details: { method: 'card', reference, amount: paidKES },
    })

    console.log('[Paystack] Payment confirmed for order:', order.id)

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[Paystack webhook error]', err)
    return new NextResponse('Webhook error', { status: 400 })
  }
}