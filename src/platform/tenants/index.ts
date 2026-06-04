import { createServerSupabaseClient } from '@/lib/supabase/server'
import { requireAuth } from '@/platform/auth'
import { redirect } from 'next/navigation'

export async function requireTenant() {
  const user = await requireAuth()
  const supabase = await createServerSupabaseClient()

  const { data: membership } = await supabase
    .from('tenant_memberships')
    .select('tenant_id, role, tenants(*)')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .single()

  // Do NOT redirect to /sign-in here — the user IS authenticated.
  // Redirecting to /sign-in would cause a loop (middleware sends them back to /hr).
  // Instead send to /no-tenant so they get a clear error.
  if (!membership) redirect('/no-tenant')

  return {
    id: membership.tenant_id as string,
    role: membership.role,
    tenant: membership.tenants,
    userId: user.id,
  }
}
