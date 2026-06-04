import type { Enums } from '@/types/supabase'

type UserRole = Enums<'user_role'>

export function hasRole(userRole: UserRole, allowed: UserRole[]): boolean {
  return allowed.includes(userRole)
}

export function requireRole(userRole: UserRole, allowed: UserRole[]): void {
  if (!hasRole(userRole, allowed)) {
    throw new Error('Forbidden: insufficient role')
  }
}
