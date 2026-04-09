/**
 * middleware.ts  (project root — Next.js picks this up automatically)
 *
 * Runs on EVERY request before it hits a route handler or page.
 * Responsibilities:
 *   1. Auth — refresh session cookies + protect private routes
 *   2. Role-based redirects — members away from /admin, /librarian
 *   3. CORS — allow configured origins
 *   4. Rate-limiting — 100 req/min per IP (in-memory, edge-compatible)
 *   5. Security headers — helmet-equivalent for Next.js
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/database.types'

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
]

/** Routes only accessible to librarians or admins */
const LIBRARIAN_ROUTES = ['/librarian', '/api/books/create']

/** Routes only accessible to admins */
const ADMIN_ROUTES = ['/admin']

/** Routes that require any authenticated user */
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/orders',
  '/borrows',
  '/api/carts',
  '/api/orders',
  '/api/borrows',
  '/api/checkout',
  '/api/recommend',
]

/** Public routes — never redirect even if unauthenticated */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/books',
  '/api/books',
  '/api/search',
  '/api/chat',
  '/api/webhooks',
]

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMITING  (sliding window, in-memory, resets on cold start)
// For production replace with Upstash Redis + @upstash/ratelimit
// ─────────────────────────────────────────────────────────────────────────────

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 100          // requests
const RATE_WINDOW_MS = 60_000   // 1 minute

function getRateLimitKey(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'anonymous'
  )
}

function checkRateLimit(req: NextRequest): boolean {
  const key = getRateLimitKey(req)
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT) return false

  entry.count++
  return true
}

// ─────────────────────────────────────────────────────────────────────────────
// SECURITY HEADERS  (helmet equivalent)
// ─────────────────────────────────────────────────────────────────────────────

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // relax for Next.js
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    ].join('; ')
  )
  return response
}

// ─────────────────────────────────────────────────────────────────────────────
// CORS
// ─────────────────────────────────────────────────────────────────────────────

function handleCors(req: NextRequest, response: NextResponse): NextResponse {
  const origin = req.headers.get('origin') ?? ''
  const isAllowed = ALLOWED_ORIGINS.includes(origin)

  if (isAllowed) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set(
      'Access-Control-Allow-Methods',
      'GET, POST, PUT, PATCH, DELETE, OPTIONS'
    )
    response.headers.set(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With'
    )
  }

  return response
}

// ─────────────────────────────────────────────────────────────────────────────
// ROUTE MATCHING HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function matchesAny(pathname: string, patterns: string[]): boolean {
  return patterns.some((p) => pathname === p || pathname.startsWith(p + '/'))
}

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 1. Preflight OPTIONS ──────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    const res = new NextResponse(null, { status: 204 })
    return handleCors(req, addSecurityHeaders(res))
  }

  // ── 2. Rate limiting ──────────────────────────────────────────────────────
  if (!checkRateLimit(req)) {
    return new NextResponse(
      JSON.stringify({ success: false, error: 'Too many requests', code: 'RATE_LIMITED' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': '60',
        },
      }
    )
  }

  // ── 3. Supabase session refresh (must happen on every request) ────────────
  let response = NextResponse.next({ request: req })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          )
          response = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: getUser() not getSession() — validates JWT server-side
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── 4. Route protection ───────────────────────────────────────────────────

  // Skip protection for fully public routes
  if (matchesAny(pathname, PUBLIC_ROUTES)) {
    return handleCors(req, addSecurityHeaders(response))
  }

  // Unauthenticated user hitting a protected route → login
  if (!user && matchesAny(pathname, PROTECTED_ROUTES)) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 5. Role-based redirects ───────────────────────────────────────────────
  if (user && (matchesAny(pathname, LIBRARIAN_ROUTES) || matchesAny(pathname, ADMIN_ROUTES))) {
    // Fetch role from profiles (lightweight select)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role ?? 'member'

    if (matchesAny(pathname, ADMIN_ROUTES) && role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    if (
      matchesAny(pathname, LIBRARIAN_ROUTES) &&
      !['librarian', 'admin'].includes(role)
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // ── 6. Authenticated user hitting auth pages → dashboard ──────────────────
  if (user && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return handleCors(req, addSecurityHeaders(response))
}

// Tell Next.js which paths to run middleware on
export const config = {
  matcher: [
    // Match all paths except static/image/favicon/public files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',

  ],
}

