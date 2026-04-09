import { NextRequest } from 'next/server'
import { ok, handleApiError } from '../../../lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    return ok({ id, message: 'Order details placeholder' })
  } catch (error) {
    return handleApiError(error)
  }
}
