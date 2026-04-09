 'use server'

import { createServerClient } from '../lib/supabase'
import { mergeGuestCart } from './cart-actions' // will create
import type { CartItem } from '../lib/types'

/**
 * Merge guest localStorage cart with user cart after login
 */
export async function mergeGuestCartOnLogin(prevState: any, formData: FormData) {
  'use server'
  
  const guestCartJson = formData.get('guestCart') as string
  const guestCartItems: CartItem[] = JSON.parse(guestCartJson || '[]')
  
  if (guestCartItems.length === 0) {
    return { success: true }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('Not authenticated')

  await mergeGuestCart(guestCartItems, user.id)

  // Clear localStorage client-side after success
  return { success: true, message: `${guestCartItems.length} items merged!`, clearLocalStorage: true }
}

