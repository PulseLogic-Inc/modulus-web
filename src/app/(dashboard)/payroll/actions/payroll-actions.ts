'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import {
  GeneratePayrollSchema,
  FinalizePayrollSchema,
  ReopenPayrollSchema,
  VoidPayrollSchema,
} from '@/domains/hr/types'
import {
  generatePayroll,
  finalizePayroll,
  reopenPayroll,
  voidPayroll,
} from '@/domains/payroll/services/payroll-service'
import type { Enums } from '@/types/supabase'

/**
 * Generate payroll for a period
 * HR Admin can initiate, but only Owner can finalize
 */
export async function generatePayrollAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string; payrollRunId?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = GeneratePayrollSchema.safeParse({
    payroll_period_id: formData.get('payroll_period_id'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  try {
    const payrollRun = await generatePayroll(tenantId, parsed.data.payroll_period_id, userId)

    revalidatePath('/payroll')
    return { payrollRunId: payrollRun.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate payroll' }
  }
}

/**
 * Finalize payroll (move to finalized state)
 * OWNER ONLY - Non-reversible without reopen limit
 */
export async function finalizePayrollAction(
  payrollRunId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()

  // OWNER ONLY - Hard-coded, not configurable
  if (role !== 'owner') {
    return { error: 'Only the Owner can finalize payroll' }
  }

  // Validate password (placeholder - real implementation would verify against auth)
  const password = formData.get('password')
  if (!password || password.toString().length < 8) {
    return { error: 'Password required for payroll finalization' }
  }

  try {
    await finalizePayroll(tenantId, payrollRunId, userId)

    revalidatePath('/payroll')
    return null
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to finalize payroll' }
  }
}

/**
 * Reopen payroll (move from finalized back to draft)
 * OWNER ONLY - Max 3 reopens per period
 */
export async function reopenPayrollAction(
  payrollRunId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()

  // OWNER ONLY
  if (role !== 'owner') {
    return { error: 'Only the Owner can reopen payroll' }
  }

  const parsed = ReopenPayrollSchema.safeParse({
    payroll_run_id: payrollRunId,
    reason: formData.get('reason'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  try {
    await reopenPayroll(tenantId, payrollRunId, parsed.data.reason, userId)

    revalidatePath('/payroll')
    return null
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to reopen payroll' }
  }
}

/**
 * Void payroll (terminal state)
 * OWNER ONLY - Cannot be undone
 */
export async function voidPayrollAction(
  payrollRunId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()

  // OWNER ONLY
  if (role !== 'owner') {
    return { error: 'Only the Owner can void payroll' }
  }

  const parsed = VoidPayrollSchema.safeParse({
    payroll_run_id: payrollRunId,
    void_reason: formData.get('void_reason'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  try {
    await voidPayroll(tenantId, payrollRunId, parsed.data.void_reason, userId)

    revalidatePath('/payroll')
    return null
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to void payroll' }
  }
}
