/**
 * lib/auth.ts  —  SERVER ONLY
 *
 * All helpers here are async and must be called inside a server context
 * (Server Component, Route Handler, or Server Action).
 * They rely on cookies() from next/headers and must NOT be imported
 * by client components.
 */

import { createServerClient } from './supabase'
import {
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
} from './errors'
import type { UserProfile, UserRole } from './types'

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedUser {
  id: string
  email: string
  profile: UserProfile
}

// ─────────────────────────────────────────────────────────────────────────────
// CORE: getCurrentUserWithRole
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Get the currently authenticated user AND their profile (with role).
 *
 * ✅ Call at the top of every Route Handler and Server Action.
 *
 * Throws:
 *   UnauthorizedError  — no valid session
 *   NotFoundError      — session exists but profile row missing
 *
 * @example
 * const user = await getCurrentUserWithRole()
 * // user.profile.role === 'member' | 'librarian' | 'admin'
 */
export async function getCurrentUserWithRole(): Promise<AuthenticatedUser> {
  const supabase = await createServerClient()

  // getUser() makes a network call to Supabase Auth to validate the JWT.
  // Never trust getSession() alone — it only reads the local cookie.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    throw new UnauthorizedError()
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    throw new NotFoundError('User profile')
  }

  return {
    id: user.id,
    email: user.email ?? '',
    profile: profile as UserProfile,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ROLE GUARDS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Require the user to have one of the specified roles.
 * Throws ForbiddenError if they don't.
 *
 * @example
 * const user = await requireRole('librarian', 'admin')
 */
export async function requireRole(
  ...roles: UserRole[]
): Promise<AuthenticatedUser> {
  const user = await getCurrentUserWithRole()

  if (!roles.includes(user.profile.role)) {
    throw new ForbiddenError(
      `This action requires one of these roles: ${roles.join(', ')}`
    )
  }

  return user
}

/**
 * Shorthand — require the user to be a librarian OR admin.
 */
export async function requireLibrarian(): Promise<AuthenticatedUser> {
  return requireRole('librarian', 'admin')
}

/**
 * Shorthand — require admin only.
 */
export async function requireAdmin(): Promise<AuthenticatedUser> {
  return requireRole('admin')
}

// ─────────────────────────────────────────────────────────────────────────────
// SOFT AUTH  (returns null instead of throwing)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Like getCurrentUserWithRole but returns null for unauthenticated users
 * instead of throwing. Use for routes that work for both guests and members.
 *
 * @example
 * const user = await getOptionalUser()
 * if (user) { ... }
 */
export async function getOptionalUser(): Promise<AuthenticatedUser | null> {
  try {
    return await getCurrentUserWithRole()
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OWNERSHIP GUARD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Verify the current user owns a resource, OR they are admin/librarian.
 * Throws ForbiddenError otherwise.
 *
 * @example
 * // In GET /api/orders/[id]:
 * await requireOwnerOrStaff(user, order.user_id)
 */
export async function requireOwnerOrStaff(
  user: AuthenticatedUser,
  resourceOwnerId: string
): Promise<void> {
  const isOwner = user.id === resourceOwnerId
  const isStaff =
    user.profile.role === 'librarian' || user.profile.role === 'admin'

  if (!isOwner && !isStaff) {
    throw new ForbiddenError(
      'You can only access your own resources'
    )
  }
}