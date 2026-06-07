'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { ClockInSchema, ClockOutSchema, ManualEntrySchema } from '@/domains/timekeeping/types'
import { toasts, createActionResult } from '@/lib/toast-server'
import { recordClockOut, recordManualEntry } from '@/domains/timekeeping/services/timekeeping-service'
import { findRecordByDate, insertRecord } from '@/domains/timekeeping/repositories/timekeeping-repository'
import type { Enums } from '@/types/supabase'

export async function recordClockInAction(
  _prev: unknown,
  formData: FormData,
) {
  const { id: tenantId, userId } = await requireTenant()

  const raw = {
    employee_id: formData.get('employee_id'),
    clock_in_time: formData.get('clock_in_time'),
  }

  const parsed = ClockInSchema.safeParse(raw)
  if (!parsed.success) {
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    const existing = await findRecordByDate(tenantId, parsed.data.employee_id, today)
    if (existing) {
      return createActionResult(
        false,
        undefined,
        'Already clocked in today',
        toasts.error('Already clocked in', 'You have already clocked in today')
      )
    }

    await insertRecord({
      tenant_id: tenantId,
      employee_id: parsed.data.employee_id,
      date: today,
      clock_in: parsed.data.clock_in_time,
      clock_out: null,
      worked_minutes: null,
      ot_minutes: 0,
      night_diff_minutes: 0,
      late_minutes: 0,
      undertime_minutes: 0,
      status: 'incomplete',
      is_manual_entry: false,
      manual_entry_by: null,
      auto_flagged: false,
      flag_reason: null,
    })

    revalidatePath('/timekeeping')
    return createActionResult(
      true,
      undefined,
      undefined,
      toasts.success('Clocked in successfully!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record clock in'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Clock in failed', message)
    )
  }
}

export async function recordClockOutAction(
  _prev: unknown,
  formData: FormData,
) {
  const { id: tenantId, userId } = await requireTenant()

  const raw = {
    employee_id: formData.get('employee_id'),
    clock_out_time: formData.get('clock_out_time'),
  }

  const parsed = ClockOutSchema.safeParse(raw)
  if (!parsed.success) {
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    await recordClockOut(tenantId, userId, parsed.data.employee_id, parsed.data.clock_out_time)
    revalidatePath('/timekeeping')
    return createActionResult(
      true,
      undefined,
      undefined,
      toasts.success('Clocked out successfully!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record clock out'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Clock out failed', message)
    )
  }
}

export async function manualEntryAction(
  _prev: unknown,
  formData: FormData,
) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const raw = {
    employee_id: formData.get('employee_id'),
    date: formData.get('date'),
    worked_minutes: Number(formData.get('worked_minutes')),
    reason: formData.get('reason') || undefined,
  }

  const parsed = ManualEntrySchema.safeParse(raw)
  if (!parsed.success) {
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    await recordManualEntry(
      tenantId,
      userId,
      parsed.data.employee_id,
      parsed.data.date,
      parsed.data.worked_minutes,
      parsed.data.reason,
    )
    revalidatePath('/timekeeping')
    return createActionResult(
      true,
      undefined,
      undefined,
      toasts.success('Manual entry recorded!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record manual entry'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Manual entry failed', message)
    )
  }
}
