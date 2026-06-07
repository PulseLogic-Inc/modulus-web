'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { ShiftPolicySchema } from '@/domains/hr/types'
import { toasts, createActionResult } from '@/lib/toast-server'
import {
  createShiftPolicy,
  updateShiftPolicyDetails,
  deactivateShiftPolicy,
} from '@/domains/hr/services/shift-policy-service'
import type { ShiftPolicyInput } from '@/domains/hr/types'
import type { Enums } from '@/types/supabase'

export async function createShiftPolicyAction(
  _prev: unknown,
  formData: FormData,
) {
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
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    const policy = await createShiftPolicy(tenantId, userId, parsed.data as ShiftPolicyInput)
    return createActionResult(
      true,
      { id: policy.id },
      undefined,
      toasts.success('Shift policy created successfully!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create shift policy'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Failed to create', message)
    )
  }
}

export async function updateShiftPolicyAction(
  policyId: string,
  _prev: unknown,
  formData: FormData,
) {
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
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    await updateShiftPolicyDetails(tenantId, userId, policyId, parsed.data as Partial<ShiftPolicyInput>)
    revalidatePath(`/hr/settings/shift-policies/${policyId}`)
    revalidatePath('/hr/settings/shift-policies')
    return createActionResult(
      true,
      { id: policyId },
      undefined,
      toasts.success('Shift policy updated successfully!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update shift policy'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Failed to update', message)
    )
  }
}

export async function deleteShiftPolicyAction(policyId: string) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  try {
    await deactivateShiftPolicy(tenantId, userId, policyId)
    revalidatePath('/hr/settings/shift-policies')
    return createActionResult(
      true,
      undefined,
      undefined,
      toasts.success('Shift policy deleted successfully!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete shift policy'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Failed to delete', message)
    )
  }
}
