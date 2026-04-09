import { NextRequest } from 'next/server'
import { ok, handleApiError } from '../../../lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ orderId: string }> }) {
  try {
    const { orderId } = await params
    return ok({ orderId, message: 'Delivery details placeholder' })
  } catch (error) {
    return handleApiError(error)
  }
}
