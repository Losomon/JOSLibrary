import { z } from 'zod'

// ─────────────────────────────────────────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────────────────────────────────────────

export const UserRole = {
  MEMBER: 'member',
  LIBRARIAN: 'librarian',
  ADMIN: 'admin',
} as const
export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export const BorrowStatus = {
  ACTIVE: 'active',
  OVERDUE: 'overdue',
  RETURNED: 'returned',
} as const
export type BorrowStatus = (typeof BorrowStatus)[keyof typeof BorrowStatus]

export const OrderStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]

export const DeliveryStatus = {
  PREPARING: 'preparing',
  IN_TRANSIT: 'in-transit',
  DELIVERED: 'delivered',
  FAILED: 'failed',
} as const
export type DeliveryStatus = (typeof DeliveryStatus)[keyof typeof DeliveryStatus]

export const PaymentMethod = {
  MPESA: 'mpesa',
  CARD: 'card',
  NONE: 'none',
} as const
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const PaymentStatus = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

// ─────────────────────────────────────────────────────────────────────────────
// CORE INTERFACES
// ─────────────────────────────────────────────────────────────────────────────

export interface DeliveryAddress {
  street: string
  city: string
  county: string
  postal_code?: string
  notes?: string
}

export interface UserProfile {
  id: string
  full_name: string | null
  role: UserRole
  phone: string | null
  delivery_address: DeliveryAddress | null
  created_at: string
  updated_at: string
}

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
  // Library fields
  available: boolean | null
  total_copies: number | null
  current_copies: number | null
  // E-commerce fields
  price: number | null
  is_for_sale: boolean | null
  stock_quantity: number | null
  purchase_count: number | null
  created_at: string | null
}

export interface BorrowRecord {
  id: string
  user_id: string
  book_id: string
  borrowed_at: string
  due_date: string
  returned_at: string | null
  fine_amount: number
  status: BorrowStatus
  // Joined fields (optional, populated by select)
  book?: Book
  profile?: UserProfile
}

export interface Cart {
  id: string
  user_id: string
  created_at: string
  updated_at: string
  items?: CartItem[]
}

export interface CartItem {
  id: string
  cart_id: string
  book_id: string
  quantity: number
  price_at_add: number
  book?: Book
}

export interface Order {
  id: string
  user_id: string
  order_number: string
  total_amount: number
  status: OrderStatus
  payment_method: PaymentMethod | null
  payment_reference: string | null
  paid_at: string | null
  delivery_fee: number
  delivery_address: DeliveryAddress | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
  delivery?: Delivery
  payments?: PaymentRecord[]
}

export interface OrderItem {
  id: string
  order_id: string
  book_id: string
  quantity: number
  price_at_purchase: number
  book?: Book
}

export interface Delivery {
  id: string
  order_id: string
  courier: string | null
  tracking_number: string | null
  estimated_delivery_date: string | null
  actual_delivery_date: string | null
  status: DeliveryStatus
  notes: string | null
}

export interface PaymentRecord {
  id: string
  order_id: string
  amount: number
  method: PaymentMethod
  reference: string | null
  status: PaymentStatus
  raw_response: any | null
  created_at: string
}

export interface AiRecommendationsCache {
  user_id: string
  book_ids: string[]
  reason: string | null
  expires_at: string
}

export interface AuditLog {
  id: string
  action: string
  user_id: string | null
  entity_type: string | null
  entity_id: string | null
  details: Record<string, unknown> | null
  created_at: string
}

// ─────────────────────────────────────────────────────────────────────────────
// AI TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface AiSearchQuery {
  raw: string
  parsed: {
    keywords?: string[]
    genres?: string[]
    maxPrice?: number
    minPrice?: number
    isForSale?: boolean
    isAvailable?: boolean
    author?: string
  }
}

export interface AiRecommendation {
  book_id: string
  book?: Book
  reason: string
  score: number
}

// ─────────────────────────────────────────────────────────────────────────────
// CHECKOUT / PAYMENT SESSION
// ─────────────────────────────────────────────────────────────────────────────

export interface CheckoutSession {
  order_id: string
  order_number: string
  amount: number
  payment_method: PaymentMethod
  // M-Pesa
  mpesa_checkout_request_id?: string
  mpesa_merchant_request_id?: string
  // Paystack
  paystack_authorization_url?: string
  paystack_access_code?: string
  paystack_reference?: string
}

// ─────────────────────────────────────────────────────────────────────────────
// API RESPONSE WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

export type ApiResponse<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string; code?: string; details?: unknown }

export type PaginatedResponse<T> = {
  success: true
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
    has_next: boolean
    has_prev: boolean
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ZOD SCHEMAS  (match every interface above exactly)
// ─────────────────────────────────────────────────────────────────────────────

export const DeliveryAddressSchema = z.object({
  street: z.string().min(3, 'Street is required'),
  city: z.string().min(2, 'City is required'),
  county: z.string().min(2, 'County is required'),
  postal_code: z.string().optional(),
  notes: z.string().optional(),
})

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string().nullable(),
  role: z.enum(['member', 'librarian', 'admin']),
  phone: z.string().nullable(),
  delivery_address: DeliveryAddressSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const BookSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  author: z.string().min(1, 'Author is required'),
  isbn: z.string().nullable(),
  genres: z.array(z.string()),
  cover_url: z.string().url().nullable().or(z.literal('').transform(() => null)),
  description: z.string().nullable(),
  ai_summary: z.string().nullable(),
  ai_tags: z.array(z.string()),
  available: z.boolean(),
  total_copies: z.number().int().min(0),
  current_copies: z.number().int().min(0),
  price: z.number().min(0),
  is_for_sale: z.boolean(),
  stock_quantity: z.number().int().min(0),
  purchase_count: z.number().int().min(0),
  created_at: z.string(),
})

export const CreateBookSchema = BookSchema.omit({
  id: true,
  ai_summary: true,
  ai_tags: true,
  purchase_count: true,
  created_at: true,
}).partial({
  isbn: true,
  cover_url: true,
  description: true,
  genres: true,
  available: true,
  total_copies: true,
  current_copies: true,
  price: true,
  is_for_sale: true,
  stock_quantity: true,
})

export const UpdateBookSchema = CreateBookSchema.partial()

export const BorrowRecordSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  book_id: z.string().uuid(),
  borrowed_at: z.string(),
  due_date: z.string(),
  returned_at: z.string().nullable(),
  fine_amount: z.number().min(0),
  status: z.enum(['active', 'overdue', 'returned']),
  book: BookSchema.optional(),
  profile: UserProfileSchema.optional(),
})

export const CreateBorrowSchema = z.object({
  book_id: z.string().uuid('Invalid book ID'),
  due_date: z
    .string()
    .datetime({ message: 'due_date must be a valid ISO datetime' })
    .refine(
      (d) => new Date(d) > new Date(),
      'Due date must be in the future'
    ),
})

export const CartItemSchema = z.object({
  id: z.string().uuid(),
  cart_id: z.string().uuid(),
  book_id: z.string().uuid(),
  quantity: z.number().int().min(1),
  price_at_add: z.number().min(0),
  book: BookSchema.optional(),
})

export const CartSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  items: z.array(CartItemSchema).optional(),
})

export const AddToCartSchema = z.object({
  book_id: z.string().uuid('Invalid book ID'),
  quantity: z.number().int().min(1).max(10).default(1),
})

export const UpdateCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(10),
})

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  book_id: z.string().uuid(),
  quantity: z.number().int().min(1),
  price_at_purchase: z.number().min(0),
  book: BookSchema.optional(),
})

export const OrderSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  order_number: z.string(),
  total_amount: z.number().min(0),
  status: z.enum(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']),
  payment_method: z.enum(['mpesa', 'card', 'none']).nullable(),
  payment_reference: z.string().nullable(),
  paid_at: z.string().nullable(),
  delivery_fee: z.number().min(0),
  delivery_address: DeliveryAddressSchema.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  items: z.array(OrderItemSchema).optional(),
})

export const DeliverySchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  courier: z.string().nullable(),
  tracking_number: z.string().nullable(),
  estimated_delivery_date: z.string().nullable(),
  actual_delivery_date: z.string().nullable(),
  status: z.enum(['preparing', 'in-transit', 'delivered', 'failed']),
  notes: z.string().nullable(),
})

export const UpdateDeliverySchema = z.object({
  courier: z.string().optional(),
  tracking_number: z.string().optional(),
  estimated_delivery_date: z.string().datetime().optional(),
  actual_delivery_date: z.string().datetime().optional(),
  status: z.enum(['preparing', 'in-transit', 'delivered', 'failed']).optional(),
  notes: z.string().optional(),
})

export const PaymentRecordSchema = z.object({
  id: z.string().uuid(),
  order_id: z.string().uuid(),
  amount: z.number().min(0),
  method: z.enum(['mpesa', 'card', 'none']),
  reference: z.string().nullable(),
  status: z.enum(['pending', 'success', 'failed', 'refunded']),
  raw_response: z.any().nullable(),
  created_at: z.string(),
})

export const CheckoutSchema = z.object({
  payment_method: z.enum(['mpesa', 'card']),
  delivery_address: DeliveryAddressSchema,
  phone: z
    .string()
    .regex(/^(\+254|0)[17]\d{8}$/, 'Invalid Kenyan phone number')
    .optional(),
}).refine(
  (data) => data.payment_method !== 'mpesa' || !!data.phone,
  { message: 'Phone number is required for M-Pesa', path: ['phone'] }
)

export const AiChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1),
})

export const AiSearchQuerySchema = z.object({
  query: z.string().min(1, 'Search query cannot be empty').max(500),
})

export const AiChatRequestSchema = z.object({
  messages: z.array(AiChatMessageSchema).min(1).max(50),
})

export const PaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const BookFiltersSchema = z.object({
  genre: z.string().optional(),
  author: z.string().optional(),
  is_for_sale: z.coerce.boolean().optional(),
  available: z.coerce.boolean().optional(),
  min_price: z.coerce.number().min(0).optional(),
  max_price: z.coerce.number().min(0).optional(),
  search: z.string().optional(),
  ...PaginationSchema.shape,
})

// Type exports from schemas
export type CreateBookInput = z.infer<typeof CreateBookSchema>
export type UpdateBookInput = z.infer<typeof UpdateBookSchema>
export type CreateBorrowInput = z.infer<typeof CreateBorrowSchema>
export type AddToCartInput = z.infer<typeof AddToCartSchema>
export type UpdateCartItemInput = z.infer<typeof UpdateCartItemSchema>
export type CheckoutInput = z.infer<typeof CheckoutSchema>
export type UpdateDeliveryInput = z.infer<typeof UpdateDeliverySchema>
export type BookFiltersInput = z.infer<typeof BookFiltersSchema>
export type AiSearchInput = z.infer<typeof AiSearchQuerySchema>
export type AiChatInput = z.infer<typeof AiChatRequestSchema>
