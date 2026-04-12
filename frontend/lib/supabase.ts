import { createServerClient as _createServerClient } from '@supabase/ssr'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

const emptyCookieHandlers = {
  getAll: () => [],
  setAll: (_cookies: { name: string; value: string; options?: any }[]) => {},
}

export function createServerClient() {
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: emptyCookieHandlers,
    }
  )
}

export function createRouteHandlerClient() {
  return _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: emptyCookieHandlers,
    }
  )
}