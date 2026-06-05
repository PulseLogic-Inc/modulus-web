'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { HolidaySchema } from '@/domains/hr/types'
import { createHoliday, updateHolidayDetails, deleteHoliday } from '@/domains/hr/services/holiday-service'
import type { Enums } from '@/types/supabase'

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

  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }

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
