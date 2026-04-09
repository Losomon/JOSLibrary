'use server'

export async function borrowBook(bookId: string, dueDate?: string) {
  const body = { book_id: bookId, due_date: dueDate }
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/borrows`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  return response.json()
}

export async function returnBook(borrowId: string) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/borrows/${borrowId}`, {
    method: 'PATCH',
  })
  return response.json()
}

