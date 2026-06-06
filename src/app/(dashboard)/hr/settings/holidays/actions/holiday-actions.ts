'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { HolidaySchema } from '@/domains/hr/types'
import { createHoliday, updateHolidayDetails, deleteHoliday } from '@/domains/hr/services/holiday-service'
import type { Enums } from '@/types/supabase'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export async function createHolidayAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = HolidaySchema.safeParse({
    date:      formData.get('date'),
    name:      formData.get('name'),
    type:      formData.get('type'),
    scope:     formData.get('scope') ?? 'company',
    recurring: formData.get('recurring') === 'true',
    multiplier_override: formData.get('multiplier_override')
      ? Number(formData.get('multiplier_override'))
      : null,
  })

  if (!parsed.success) return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }

  try {
    await createHoliday(tenantId, userId, parsed.data)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create holiday' }
  }

  revalidatePath('/hr/settings/holidays')
  return null
}

export async function deleteHolidayAction(id: string): Promise<void> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])
  await deleteHoliday(tenantId, userId, id)
  revalidatePath('/hr/settings/holidays')
}

/**
 * Sync PH statutory holidays for a given year
 * Calls the sync-ph-holidays edge function
 */
export async function syncPhHolidaysAction(
  _prev: { error?: string; synced?: number } | null,
  formData: FormData,
): Promise<{ error?: string; synced?: number } | null> {
  const { id: tenantId, role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const year = Number(formData.get('year')) || new Date().getFullYear()

  if (year < 2000 || year > 2100) {
    return { error: 'Invalid year' }
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('Missing Supabase configuration')
    }

    const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-ph-holidays`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ tenant_id: tenantId, year }),
    })

    if (!response.ok) {
      const error = await response.json()
      return { error: error.error || `Failed to sync holidays (HTTP ${response.status})` }
    }

    const result = await response.json()

    revalidatePath('/hr/settings/holidays')
    return { synced: result.synced }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to sync PH holidays'
    return { error: message }
  }
}
