'use server'

import { createServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/database.types'
import { CreateBookSchema, UpdateBookSchema } from '@/lib/types'

// Re-export API logic as server actions for forms/UI
export async function createBook(formData: FormData) {
  // Parse form → POST to /api/books
  const body = Object.fromEntries(formData)
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.json()
}

export async function updateBook(id: string, formData: FormData) {
  const body = Object.fromEntries(formData)
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/books/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.json()
}

export async function deleteBook(id: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/books/${id}`, {
    method: 'DELETE',
  })
  return response.json()
}

