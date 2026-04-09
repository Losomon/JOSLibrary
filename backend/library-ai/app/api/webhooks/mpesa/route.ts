/**
 * app/api/webhooks/mpesa/route.ts
 *
 * POST /api/webhooks/mpesa
 *   Safaricom calls this after the customer completes/cancels the STK push.
 *   Uses service_role (admin) client — bypasses RLS.
 *   Must return 200 immediately or Safaricom retries.
 *
 * Flow on success:
 *   1. Verify IP (production) / parse body
 *   2. Find order by CheckoutRequestID
 *   3. Mark order "paid", store receipt
 *   4. Insert payments record
 *   5. Decrement stock_quantity for each item
 *   6. Create delivery record
 *   7. Clear cart
 *   8. Write audit log
 */

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '../../../lib/supabase'
import {
  parseMpesaCallback,
  verifyMpesaWebhook,
  type MpesaCallbackBody,
} from '../../../lib/payments/mpesa'
import { getEstimatedDeliveryDate } from '../../../lib/utils'

export async function POST(req: NextRequest) {
  // Always respond 200 — Safaricom retries on any non-200
  try {
    verifyMpesaWebhook(req)

    const body = await req.json() as MpesaCallbackBody
    const cb   = parseMpesaCallback(body)

    // Non-zero result = user cancelled or failed — log and return
    if (cb.resultCode !== 0) {
      console.log('[M-Pesa] Payment failed/cancelled:', cb.resultDesc, cb.checkoutRequestId)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    const supabase = createAdminClient()

    // ── Find order by CheckoutRequestID (stored as payment_reference) ─────────
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, user_id, total_amount, status')
      .eq('payment_reference', cb.checkoutRequestId)
      .single()

    if (orderError || !order) {
      console.error('[M-Pesa] Order not found for ref:', cb.checkoutRequestId)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // Idempotency — if already paid, skip
    if (order.status === 'paid') {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    // ── Mark order paid ───────────────────────────────────────────────────────
    await supabase
      .from('orders')
      .update({
        status:     'paid',
        paid_at:    new Date().toISOString(),
        payment_method: 'mpesa',
      })
      .eq('id', order.id)

    // ── Insert payment record ─────────────────────────────────────────────────
    await supabase.from('payments').insert({
      order_id:  order.id,
      amount:    cb.amount ?? order.total_amount,
      method:    'mpesa',
      reference: cb.mpesaReceiptNumber || cb.checkoutRequestId,
      status:    'success',
    })

    // ── Fetch order items + decrement stock ───────────────────────────────────
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

    // ── Create delivery record ────────────────────────────────────────────────
    await supabase.from('deliveries').insert({
      order_id:                 order.id,
      status:                   'preparing',
      estimated_delivery_date:  getEstimatedDeliveryDate(2),
    })

    // ── Clear cart ────────────────────────────────────────────────────────────
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', order.user_id!)
      .single()

    if (cart) {
      await supabase.from('cart_items').delete().eq('cart_id', cart.id)
    }

    // ── Audit log ─────────────────────────────────────────────────────────────
    await supabase.from('audit_logs').insert({
      action:      'payment_confirmed',
      user_id:     order.user_id!,
      entity_type: 'order',
      entity_id:   order.id,
      details: {
        method:  'mpesa',
        receipt: cb.mpesaReceiptNumber,
        amount:  cb.amount,
      },
    })

    console.log('[M-Pesa] Payment confirmed for order:', order.id)

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  } catch (err) {
    console.error('[M-Pesa webhook error]', err)
    // Still return 200 — let Safaricom think we accepted it
    // Log to Sentry / monitoring separately
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}