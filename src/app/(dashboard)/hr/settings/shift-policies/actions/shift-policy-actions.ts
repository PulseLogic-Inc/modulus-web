'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { ShiftPolicySchema } from '@/domains/hr/types'
import {
  createShiftPolicy,
  updateShiftPolicyDetails,
  deactivateShiftPolicy,
} from '@/domains/hr/services/shift-policy-service'
import type { ShiftPolicyInput } from '@/domains/hr/types'
import type { Enums } from '@/types/supabase'

export async function createShiftPolicyAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  // Parse form data
  const raw: Record<string, unknown> = {
    name:               formData.get('name'),
    grace_period_min:   Number(formData.get('grace_period_min')) || 0,
    ot_threshold_min:   Number(formData.get('ot_threshold_min')) || 480,
    night_diff_enabled: formData.get('night_diff_enabled') === 'true',
    night_diff_start:   formData.get('night_diff_start') || '22:00',
    night_diff_end:     formData.get('night_diff_end') || '06:00',
    days: [],
  }

  // Parse day schedules (0-6 for Sun-Sat)
  const days: Array<Record<string, unknown>> = []
  for (let i = 0; i < 7; i++) {
    days.push({
      day_of_week:   i,
      start_time:    formData.get(`day_${i}_start_time`),
      end_time:      formData.get(`day_${i}_end_time`),
      is_rest_day:   formData.get(`day_${i}_is_rest_day`) === 'true',
      break_minutes: Number(formData.get(`day_${i}_break_minutes`)) || 60,
      break_paid:    formData.get(`day_${i}_break_paid`) === 'true',
    })
  }
  raw.days = days

  const parsed = ShiftPolicySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  let policy
  try {
    policy = await createShiftPolicy(tenantId, userId, parsed.data as ShiftPolicyInput)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create shift policy' }
  }

  redirect(`/hr/settings/shift-policies/${policy.id}`)
}

export async function updateShiftPolicyAction(
  policyId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  // Parse form data
  const raw: Record<string, unknown> = {
    name:               formData.get('name'),
    grace_period_min:   Number(formData.get('grace_period_min')) || 0,
    ot_threshold_min:   Number(formData.get('ot_threshold_min')) || 480,
    night_diff_enabled: formData.get('night_diff_enabled') === 'true',
    night_diff_start:   formData.get('night_diff_start') || '22:00',
    night_diff_end:     formData.get('night_diff_end') || '06:00',
    days: [],
  }

  // Parse day schedules
  const days: Array<Record<string, unknown>> = []
  for (let i = 0; i < 7; i++) {
    days.push({
      day_of_week:   i,
      start_time:    formData.get(`day_${i}_start_time`),
      end_time:      formData.get(`day_${i}_end_time`),
      is_rest_day:   formData.get(`day_${i}_is_rest_day`) === 'true',
      break_minutes: Number(formData.get(`day_${i}_break_minutes`)) || 60,
      break_paid:    formData.get(`day_${i}_break_paid`) === 'true',
    })
  }
  raw.days = days

  const parsed = ShiftPolicySchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  try {
    await updateShiftPolicyDetails(tenantId, userId, policyId, parsed.data as Partial<ShiftPolicyInput>)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update shift policy' }
  }

  revalidatePath(`/hr/settings/shift-policies/${policyId}`)
  revalidatePath('/hr/settings/shift-policies')
  return null
}

export async function deleteShiftPolicyAction(policyId: string): Promise<void> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  try {
    await deactivateShiftPolicy(tenantId, userId, policyId)
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to delete shift policy')
  }

  revalidatePath('/hr/settings/shift-policies')
}
