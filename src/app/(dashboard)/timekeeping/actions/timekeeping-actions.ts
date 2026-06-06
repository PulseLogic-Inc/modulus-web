'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { ClockInSchema, ClockOutSchema, ManualEntrySchema } from '@/domains/timekeeping/types'
import { recordClockOut, recordManualEntry } from '@/domains/timekeeping/services/timekeeping-service'
import { findRecordByDate, insertRecord } from '@/domains/timekeeping/repositories/timekeeping-repository'
import type { Enums } from '@/types/supabase'

/**
 * Clock in action
 * Creates a timekeeping record with clock_in time
 * Status: 'incomplete' (waiting for clock out)
 */
export async function recordClockInAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  // Clock in: allow staff to clock in themselves, or admins to clock in others
  // For MVP, allow any authenticated user to clock in
  // TODO: Add role check if needed (e.g., only staff or hr_admin)

  const raw = {
    employee_id: formData.get('employee_id'),
    clock_in_time: formData.get('clock_in_time'),
  }

  const parsed = ClockInSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  try {
    const today = new Date().toISOString().split('T')[0]

    // Check if record already exists
    const existing = await findRecordByDate(tenantId, parsed.data.employee_id, today)
    if (existing) {
      return { error: 'You have already clocked in today' }
    }

    // Insert new record with clock_in
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
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to record clock in' }
  }

  revalidatePath('/timekeeping')
  return null
}

/**
 * Clock out action
 * Calls recordClockOut service which:
 * 1. Fetches today's record (must have clock_in)
 * 2. Calculates worked hours via Worked Hours Engine
 * 3. Auto-flags anomalies
 * 4. Logs audit
 */
export async function recordClockOutAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()

  const raw = {
    employee_id: formData.get('employee_id'),
    clock_out_time: formData.get('clock_out_time'),
  }

  const parsed = ClockOutSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  try {
    await recordClockOut(tenantId, userId, parsed.data.employee_id, parsed.data.clock_out_time)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to record clock out' }
  }

  revalidatePath('/timekeeping')
  return null
}

/**
 * Manual timekeeping entry action
 * For past dates or system corrections
 * Requires HR Admin or Owner role
 */
export async function manualEntryAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
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
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
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
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to record manual entry' }
  }

  revalidatePath('/timekeeping')
  return null
}
