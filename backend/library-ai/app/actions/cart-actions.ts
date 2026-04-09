'use server'

import { createServerClient } from '../lib/supabase'
import { checkBookStock } from '../lib/utils'
import type { CartItem, Book } from '../lib/types'
import { revalidatePath } from 'next/cache'

/**
 * Add/merge guest cart items to localStorage or server cart
 */
/**
 * Server-only addToCart for authenticated users. 
 * Guests use client-side localStorage addToGuestCart hook/action.
 */
export async function addToCart(book: Book, quantity = 1) {
  'use server'
  
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    throw new Error('Must be authenticated to add to cart')
  }
  
  // Server cart
  checkBookStock(book, quantity)
  
  const cartId = `cart_${user.id}`
  const { error } = await supabase
    .from('cart_items')
    .upsert({
      cart_id: cartId,
      book_id: book.id,
      quantity: quantity,
      price_at_add: book.price ?? 0
    }, { onConflict: 'cart_id, book_id' })
  
  if (error) throw error
  
  revalidatePath('/cart')
}

export async function addToGuestCart(book: Book, quantity = 1) {
  'use client'
  
  const guestCart: any[] = JSON.parse(localStorage.getItem('guestCart') || '[]')
  const existingIndex = guestCart.findIndex(item => item.book_id === book.id)
  
  if (existingIndex > -1) {
    guestCart[existingIndex].quantity += quantity
  } else {
    guestCart.push({ 
      id: crypto.randomUUID(), 
      book_id: book.id, 
      quantity, 
      price_at_add: book.price,
      book 
    })
  }
  
  localStorage.setItem('guestCart', JSON.stringify(guestCart))
}

/**
 * Merge guest cart with user cart on login
 */
export async function mergeGuestCart(guestItems: CartItem[], userId: string) {
  const supabase = await createServerClient()
  
  for (const item of guestItems) {
    const book = await supabase.from('books').select('*').eq('id', item.book_id).single()
    if (book.data) {
      checkBookStock(book.data as Book, item.quantity)
      
      await supabase
        .from('cart_items')
        .upsert({
          cart_id: `cart_${userId}`,
          book_id: item.book_id,
          quantity: item.quantity ?? 1,
          price_at_add: item.price_at_add ?? 0
        }, { onConflict: 'cart_id, book_id' })
    }
  }
}

/**
 * Get current cart (guest or user)
 */
export async function getCurrentCart() {
  'use server'
  
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    return []
  }
  
  const { data } = await supabase
    .from('cart_items')
    .select(`
      *,
      book:books (
        id, title, author, price, cover_url
      )
    `)
    .eq('cart_id', `cart_${user.id}`)
  return data || []
}

// Clear cart after checkout
export async function clearCart() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user?.id) {
    throw new Error('Must be authenticated to clear cart')
  }
  await supabase.from('cart_items').delete().eq('cart_id', `cart_${user.id}`)
  
  revalidatePath('/cart')
}

