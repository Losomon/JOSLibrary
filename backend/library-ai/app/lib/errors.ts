/**
 * lib/errors.ts
 *
 * Typed custom error classes.
 * Every API route and server action catches these and maps them
 * to the correct HTTP status + ApiResponse<never>.
 */

// ─────────────────────────────────────────────────────────────────────────────
// BASE
// ─────────────────────────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: unknown

  constructor(message: string, code: string, statusCode = 500, details?: unknown) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.details = details
    // Restore prototype chain (TypeScript + extends Error quirk)
    Object.setPrototypeOf(this, new.target.prototype)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTH ERRORS
// ─────────────────────────────────────────────────────────────────────────────

/** User is not logged in */
export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 'UNAUTHORIZED', 401)
  }
}

/** User is logged in but lacks the required role */
export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action') {
    super(message, 'FORBIDDEN', 403)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RESOURCE ERRORS
// ─────────────────────────────────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 'CONFLICT', 409)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// STOCK / INVENTORY ERRORS
// ─────────────────────────────────────────────────────────────────────────────

export class StockError extends AppError {
  constructor(message: string, public readonly available: number = 0) {
    super(message, 'OUT_OF_STOCK', 409, { available })
  }
}

export class BorrowLimitError extends AppError {
  constructor(limit = 3) {
    super(
      `You have reached the borrow limit of ${limit} books`,
      'BORROW_LIMIT',
      409,
      { limit }
    )
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION ERRORS
// ─────────────────────────────────────────────────────────────────────────────

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 422, details)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT ERRORS
// ─────────────────────────────────────────────────────────────────────────────

export class PaymentError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 'PAYMENT_ERROR', 402, details)
  }
}

export class WebhookSignatureError extends AppError {
  constructor() {
    super('Invalid webhook signature', 'INVALID_SIGNATURE', 401)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMIT
// ─────────────────────────────────────────────────────────────────────────────

export class RateLimitError extends AppError {
  constructor(retryAfter = 60) {
    super('Too many requests. Please slow down.', 'RATE_LIMITED', 429, { retryAfter })
  }
}