'use server'
import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { toasts, createActionResult } from '@/lib/toast-server'
import { generatePayroll, finalizePayroll, reopenPayroll, voidPayroll } from '@/domains/payroll/services/payroll-service'
import type { Enums } from '@/types/supabase'

export async function generatePayrollAction(period: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])
  try {
    await generatePayroll(tenantId, userId, period)
    revalidatePath('/payroll')
    return createActionResult(true, undefined, undefined, toasts.success('Payroll generated!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to generate'
    return createActionResult(false, undefined, msg, toasts.error('Generation failed', msg))
  }
}

export async function finalizePayrollAction(periodId: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  if (role !== 'owner') return createActionResult(false, undefined, 'Only Owner can finalize payroll', toasts.error('Unauthorized', 'Only Owner can finalize'))
  try {
    await finalizePayroll(tenantId, userId, periodId)
    revalidatePath('/payroll')
    return createActionResult(true, undefined, undefined, toasts.success('Payroll finalized!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to finalize'
    return createActionResult(false, undefined, msg, toasts.error('Finalization failed', msg))
  }
}

export async function reopenPayrollAction(periodId: string, reason: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  if (role !== 'owner') return createActionResult(false, undefined, 'Only Owner can reopen payroll', toasts.error('Unauthorized', 'Only Owner can reopen'))
  try {
    await reopenPayroll(tenantId, userId, periodId, reason)
    revalidatePath('/payroll')
    return createActionResult(true, undefined, undefined, toasts.success('Payroll reopened!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to reopen'
    return createActionResult(false, undefined, msg, toasts.error('Reopen failed', msg))
  }
}

export async function voidPayrollAction(periodId: string, reason: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  if (role !== 'owner') return createActionResult(false, undefined, 'Only Owner can void payroll', toasts.error('Unauthorized', 'Only Owner can void'))
  try {
    await voidPayroll(tenantId, userId, periodId, reason)
    revalidatePath('/payroll')
    return createActionResult(true, undefined, undefined, toasts.success('Payroll voided!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to void'
    return createActionResult(false, undefined, msg, toasts.error('Void failed', msg))
  }
}
