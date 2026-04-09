import { NextRequest } from 'next/server'
import { handleApiError, ok, parseBody } from '../../lib/utils'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const CheckoutSchema = z.object({
  items: z.array(z.object({
    bookId: z.string(),
    quantity: z.number().positive(),
  })),
})

export async function POST(req: NextRequest) {
  try {
    const body = await parseBody(req, CheckoutSchema)
    return ok({ orderId: 'mock-order-id', total: 0 })
  } catch (err) {
    return handleApiError(err)
  }
}

