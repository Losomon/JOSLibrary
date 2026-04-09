/**
 * lib/utils.ts
 *
 * Three categories of helpers:
 *   1. API response builders  — consistent ApiResponse<T> shaping
 *   2. Error handling         — format any thrown value into ApiResponse
 *   3. Stock & borrow checks  — business rule enforcement
 *   4. Validation helpers     — Zod + request parsing
 *   5. General utilities      — order numbers, date helpers, KES formatting
 */

import { ZodError, ZodSchema } from 'zod'
import { NextResponse } from 'next/server'
import { AppError, StockError, BorrowLimitError, ValidationError } from './errors'
import type { ApiResponse, Book, BorrowRecord } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// 1. API RESPONSE BUILDERS
// ─────────────────────────────────────────────────────────────────────────────

export function ok<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status: 200 })
}

export function created<T>(data: T, message?: string): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status: 201 })
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

export function apiError(
  message: string,
  status = 500,
  code?: string,
  details?: unknown
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: message, code, details },
    { status }
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ERROR HANDLING
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Central error handler for Route Handlers.
 * Maps any thrown value → correct HTTP status + ApiResponse<never>.
 *
 * Usage:
 *   } catch (err) {
 *     return handleApiError(err)
 *   }
 */
export function handleApiError(err: unknown): NextResponse<ApiResponse<never>> {
  // Our typed errors
  if (err instanceof AppError) {
    return apiError(err.message, err.statusCode, err.code, err.details)
  }

  // Zod validation errors (thrown directly)
  if (err instanceof ZodError) {
    return apiError(
      'Validation failed',
      422,
      'VALIDATION_ERROR',
      formatZodError(err)
    )
  }

  // Supabase unique violation
  if (isPostgresError(err, '23505')) {
    return apiError('A record with this value already exists', 409, 'CONFLICT')
  }

  // Supabase foreign key violation
  if (isPostgresError(err, '23503')) {
    return apiError('Referenced record does not exist', 400, 'INVALID_REFERENCE')
  }

  // Unknown — log server-side, return generic message to client
  console.error('[API Error]', err)
  return apiError('An unexpected error occurred', 500, 'INTERNAL_ERROR')
}

/**
 * Same as handleApiError but for Server Actions (returns plain objects).
 */
export function handleActionError(err: unknown): ApiResponse<never> {
  if (err instanceof AppError) {
    return { success: false, error: err.message, code: err.code, details: err.details }
  }
  if (err instanceof ZodError) {
    return { success: false, error: 'Validation failed', code: 'VALIDATION_ERROR', details: formatZodError(err) }
  }
  console.error('[Action Error]', err)
  return { success: false, error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' }
}

function isPostgresError(err: unknown, code: string): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === code
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ZOD VALIDATION HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export interface ZodFieldError {
  field: string
  message: string
}

/**
 * Format a ZodError into a flat array of { field, message } pairs.
 * Makes frontend error display easy.
 */
export function formatZodError(err: ZodError): ZodFieldError[] {
  return err.issues.map((issue) => ({
    field: issue.path.join('.') || 'root',
    message: issue.message,
  }))
}

/**
 * Parse + validate a request body against a Zod schema.
 * Throws ValidationError (422) on failure.
 *
 * @example
 * const body = await parseBody(req, CreateBookSchema)
 */
export async function parseBody<T>(
  req: Request,
  schema: ZodSchema<T>
): Promise<T> {
  let json: unknown
  try {
    json = await req.json()
  } catch {
    throw new ValidationError('Request body must be valid JSON')
  }

  const result = schema.safeParse(json)
  if (!result.success) {
    throw new ValidationError('Validation failed', formatZodError(result.error))
  }
  return result.data
}

/**
 * Parse + validate URL search params against a Zod schema.
 * Throws ValidationError (422) on failure.
 *
 * @example
 * const filters = parseSearchParams(req, BookFiltersSchema)
 */
export function parseSearchParams<T>(
  req: Request,
  schema: ZodSchema<T>
): T {
  const url = new URL(req.url)
  const raw = Object.fromEntries(url.searchParams.entries())
  const result = schema.safeParse(raw)
  if (!result.success) {
    throw new ValidationError('Invalid query parameters', formatZodError(result.error))
  }
  return result.data
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. STOCK & BORROW CHECK HELPERS
// ─────────────────────────────────────────────────────────────────────────────

export function checkBookStock(book: Pick<Book, 'title' | 'is_for_sale' | 'stock_quantity' | 'current_copies'>, quantity = 1) {
  if (!book.is_for_sale) {
    throw new StockError(`"${book.title}" is not for sale`, 0)
  }
  const stock = book.stock_quantity ?? 0
  if (stock < quantity) {
    throw new StockError(
      `Insufficient stock for "${book.title}". Available: ${stock}`,
      stock
    )
  }
  const copies = book.current_copies ?? 0
  if (copies < 1) {
    throw new StockError(`"${book.title}" has no borrowable copies`, 0)
  }
}

/** Max simultaneous borrows per member */
export const BORROW_LIMIT = 3

/** Default borrow period in days */
export const DEFAULT_BORROW_DAYS = 14

/** Flat delivery fee in KES */
export const DELIVERY_FEE_KES = Number(process.env.DELIVERY_FEE_FLAT ?? 150)

/**
 * Throw StockError if a book has no borrowable copies.
 */
export function assertBorrowable(book: Pick<Book, 'title' | 'available' | 'current_copies'>): void {
  const copies = book.current_copies ?? 0
  if (!book.available || copies < 1) {
    throw new StockError(
      `"${book.title}" is currently unavailable for borrowing`,
      copies
    )
  }
}

/**
 * Throw StockError if a book doesn't have enough stock for purchase.
 * Now null-safe.
 */
export function assertPurchasable(
  book: Pick<Book, 'title' | 'is_for_sale' | 'stock_quantity'>,
  quantity = 1
): void {
  if (book.is_for_sale !== true) {
    throw new StockError(`"${book.title}" is not available for purchase`, 0)
  }
  if ((book.stock_quantity ?? 0) < quantity) {
    throw new StockError(
      `Insufficient stock for "${book.title}". Only ${book.stock_quantity ?? 0} left.`,
      book.stock_quantity ?? 0
    )
  }
}

/**
 * Throw BorrowLimitError if the user has too many active borrows.
 */
export function assertBorrowLimit(
  activeBorrows: Pick<BorrowRecord, 'status'>[]
): void {
  const active = activeBorrows.filter(
    (b) => b.status === 'active' || b.status === 'overdue'
  ).length

  if (active >= BORROW_LIMIT) {
    throw new BorrowLimitError(BORROW_LIMIT)
  }
}

/**
 * Calculate fine for an overdue borrow.
 * Rate: 10 KES per day overdue.
 */
export function calculateFine(
  dueDate: string,
  returnedAt?: string | null
): number {
  const due = new Date(dueDate)
  const now = returnedAt ? new Date(returnedAt) : new Date()
  if (now <= due) return 0

  const daysOverdue = Math.ceil((now.getTime() - due.getTime()) / (1000 * 60 * 60 * 24))
  return daysOverdue * 10 // 10 KES per day
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. GENERAL UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Generate a unique human-readable order number.
 * Format: ORD-YYYYMMDD-XXXXX
 *
 * @example  "ORD-20260402-A3F9K"
 */
export function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.random().toString(36).toUpperCase().slice(2, 7)
  return `ORD-${date}-${random}`
}

/**
 * Return due date as ISO string N days from now.
 */
export function getDueDate(days = DEFAULT_BORROW_DAYS): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/**
 * Return estimated delivery date as ISO string (now + 2 days).
 */
export function getEstimatedDeliveryDate(days = 2): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/**
 * Format a number as Kenyan Shillings.
 * @example  formatKES(1500) → "KES 1,500.00"
 */
export function formatKES(amount: number): string {
  return `KES ${amount.toLocaleString('en-KE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Check if a borrow is currently overdue.
 */
export function isOverdue(dueDate: string, returnedAt?: string | null): boolean {
  if (returnedAt) return false
  return new Date() > new Date(dueDate)
}

/**
 * Slugify a string for URL-safe use.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '')
    .replace(/[\\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Safely parse JSON — returns null on failure instead of throwing.
 */
export function safeJsonParse<T>(json: string): T | null {
  try {
    return JSON.parse(json) as T
  } catch {
    return null
  }
}

/**
 * Strip undefined values from an object (useful for Supabase updates).
 */
export function compactObject<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined)
  ) as Partial<T>
}

/**
 * Delay for N milliseconds (use in retry logic).
 */
export const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms))

type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, boolean>

export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = []
  for (const input of inputs) {
    if (!input) continue
    if (typeof input === 'string' || typeof input === 'number') {
      classes.push(String(input))
    } else if (Array.isArray(input)) {
      classes.push(cn(...input))
    } else if (typeof input === 'object') {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key)
      }
    }
  }
  return classes.join(' ')
}

