export interface Book {
  id: string
  title: string
  author: string
  isbn: string | null
  genres: string[] | null
  cover_url: string | null
  description: string | null
  ai_summary: string | null
  ai_tags: string[] | null
  available: boolean | null
  total_copies: number | null
  current_copies: number | null
  price: number | null
  is_for_sale: boolean | null
  stock_quantity: number | null
  purchase_count: number | null
  created_at: string | null
}

export interface AiChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface BorrowRecord {
  id: string
  status: 'active' | 'overdue' | 'returned'
  user_id: string
  book_id: string
  due_date: string
  fine_amount: number | null
  book: Book
}

export interface Order {
  id: string
  status: string
  user_id: string
  order_number: string
  total_amount: number
  created_at: string
  items: Array<{
    quantity: number
    book: {
      title: string
    }
  }>
}

export interface UserProfile {
  id: string
  full_name: string | null
  email: string | null
  role: 'member' | 'librarian' | 'admin'
  phone: string | null
}
