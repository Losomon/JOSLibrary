/**
 * lib/supabase.ts
 *
 * Two Supabase instances:
 *   1. createClient()       → browser / client components (anon key)
 *   2. createServerClient() → server components, API routes, Server Actions
 *                             Uses cookies for session persistence (SSR-safe)
 *   3. createAdminClient()  → webhooks / service_role (bypasses RLS)
 *                             Never expose to client. Server-only.
 */

import { createBrowserClient } from '@supabase/ssr'
import { createServerClient as createSupabaseServerClient } from '@supabase/ssr'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

// ─────────────────────────────────────────────────────────────────────────────
// ENV VALIDATION — fail fast, fail loud
// ─────────────────────────────────────────────────────────────────────────────

function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) throw new Error(`Missing required environment variable: ${key}`)
  return value
}

const SUPABASE_URL = requireEnv('NEXT_PUBLIC_SUPABASE_URL')
const SUPABASE_ANON_KEY = requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

// ─────────────────────────────────────────────────────────────────────────────
// 1. BROWSER CLIENT  (client components only)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Use inside client components and hooks.
 * Safe to call multiple times — internally memoised by @supabase/ssr.
 */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. SERVER CLIENT  (Server Components, Route Handlers, Server Actions)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cookie-based server client.
 * Must be called inside a request context (not at module level).
 *
 * Usage:
 *   const supabase = await createServerClient()
 *   const { data: { user } } = await supabase.auth.getUser()
 */
export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // setAll is called from a Server Component where cookies are read-only.
          // This is safe to ignore — middleware handles session refresh.
        }
      },
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ADMIN CLIENT  (service_role — bypasses RLS)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Use ONLY in:
 *   - /api/webhooks/* (M-Pesa, Paystack callbacks)
 *   - Background jobs / Edge Functions
 *
 * NEVER import into client components.
 * The file is server-only safe because SUPABASE_SERVICE_ROLE_KEY
 * is not prefixed with NEXT_PUBLIC_.
 */
export function createAdminClient() {
  const serviceRoleKey = requireEnv('SUPABASE_SERVICE_ROLE_KEY')

  return createSupabaseAdminClient<Database>(SUPABASE_URL, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVENIENCE TYPE RE-EXPORTS
// ─────────────────────────────────────────────────────────────────────────────

export type { Database }
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']