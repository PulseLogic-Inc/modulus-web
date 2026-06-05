'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { WorkLocationSchema } from '@/domains/hr/types'
import {
  createWorkLocation,
  updateWorkLocationDetails,
  deactivateWorkLocation,
} from '@/domains/hr/services/work-location-service'
import type { Enums } from '@/types/supabase'

export async function createWorkLocationAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = WorkLocationSchema.safeParse({
    name:    formData.get('name'),
    code:    formData.get('code') || undefined,
    address: formData.get('address') || undefined,
    type:    formData.get('type'),
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  await createWorkLocation(tenantId, userId, parsed.data)
  revalidatePath('/hr/settings/work-locations')
  return null
}

export async function updateWorkLocationAction(
  id: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = WorkLocationSchema.safeParse({
    name:    formData.get('name'),
    code:    formData.get('code') || undefined,
    address: formData.get('address') || undefined,
    type:    formData.get('type'),
  })
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? 'Invalid input' }

  await updateWorkLocationDetails(tenantId, userId, id, parsed.data)
  revalidatePath('/hr/settings/work-locations')
  return null
}

export async function deactivateWorkLocationAction(id: string): Promise<void> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])
  await deactivateWorkLocation(tenantId, userId, id)
  revalidatePath('/hr/settings/work-locations')
}
