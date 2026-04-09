/**
 * lib/payments/paystack.ts  —  SERVER ONLY
 *
 * Paystack API v2
 * Docs: https://paystack.com/docs/api/
 * Sandbox: https://dashboard.paystack.com/#/register
 */

import { PaymentError, WebhookSignatureError } from '../errors'

// ─────────────────────────────────────────────────────────────────────────────
// ENV
// ─────────────────────────────────────────────────────────────────────────────

function requireEnv(key: string): string {
  const v = process.env[key]
  if (!v) throw new Error(`Missing env: ${key}`)
  return v
}

const PAYSTACK_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api.paystack.co'
  : 'https://api.paystack.co'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface InitializeResult {
  status: boolean
  message: string
  data: {
    access_code: string
    authorization_url: string
    reference: string
  }
}

export interface VerifyResult {
  status: boolean
  message: string
  data: {
    amount: number
    currency: string
    reference: string
    status: 'success' | 'failed'
    customer: { email: string }
    payments: Array<{
      reference: string
      amount: number
      status: string
    }>
  }
}

export interface PaystackWebhookBody {
  event: 'charge.success'
  data: {
    reference: string
    amount: number
    status: 'success'
    customer: { email: string }
  }
}

export interface PaystackWebhookEvent {
  event: string
  data: {
    reference: string
    amount: number
    paid_at?: string
    metadata?: Record<string, unknown>
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// INITIALIZE PAYMENT
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Initialize Paystack transaction → returns payment URL.
 * Customer completes on Paystack hosted page.
 *
 * @param email      Customer email
 * @param amount     Amount in KES (smallest unit)
 * @param orderId    Reference (max 50 chars)
 */
export async function initializePaystack(
  email: string,
  amount: number,
  orderId: string
): Promise<InitializeResult> {
  const secretKey = requireEnv('PAYSTACK_SECRET_KEY')

  const body = {
    email,
    amount: Math.ceil(amount * 100), // Paystack uses smallest unit
    reference: orderId,
    callback_url: `${requireEnv('NEXT_PUBLIC_APP_URL')}/order/confirmed`,
    metadata: {
      order_id: orderId,
      app: 'JOS Library',
    },
  }

  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok || !data.status) {
    throw new PaymentError(
      data.message ?? 'Paystack initialization failed',
      data
    )
  }

  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// VERIFY TRANSACTION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify Paystack transaction status.
 */
export async function verifyPaystack(reference: string): Promise<VerifyResult> {
  const secretKey = requireEnv('PAYSTACK_SECRET_KEY')

  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  })

  const data = await res.json()

  if (!res.ok || !data.status) {
    throw new PaymentError(
      data.message ?? 'Paystack verification failed',
      data
    )
  }

  return data
}

// ─────────────────────────────────────────────────────────────────────────────
// WEBHOOK VERIFY  (Paystack HMAC SHA512 signature)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify Paystack webhook authenticity using x-paystack-signature header.
 * Throws WebhookSignatureError if invalid.
 */
export async function verifyPaystackWebhook(req: Request): Promise<void> {
  const payload = await req.text()
  const signature = req.headers.get('x-paystack-signature')

  if (!signature) {
    throw new WebhookSignatureError()
  }

  const secretKey = requireEnv('PAYSTACK_SECRET_KEY')
  const expectedSig = (await import('crypto'))
    .createHmac('sha512', secretKey)
    .update(payload)
    .digest('hex')

  if (signature !== expectedSig) {
    throw new WebhookSignatureError()
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PARSE WEBHOOK
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Parse Paystack webhook into flat object.
 */
export function parsePaystackWebhook(body: PaystackWebhookBody) {
  return {
    event: body.event,
    reference: body.data.reference,
    amount: body.data.amount / 100, // Convert subunits
    status: body.data.status,
    customerEmail: body.data.customer.email,
  }
}

export async function verifyPaystackSignature(rawBody: string, signature: string | null): Promise<void> {
  if (!signature) {
    throw new WebhookSignatureError()
  }
  
  const secretKey = requireEnv('PAYSTACK_SECRET_KEY')
  const expectedSig = (await import('crypto'))
    .createHmac('sha512', secretKey)
    .update(rawBody)
    .digest('hex')

  if (signature !== expectedSig) {
    throw new WebhookSignatureError()
  }
}

