'use server'
import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { OvertimeRequestSchema, ApprovalSchema } from '@/domains/hr/types'
import { toasts, createActionResult } from '@/lib/toast-server'
import { submitOvertimeRequest, approveOvertimeRequest, rejectOvertimeRequest } from '@/domains/hr/services/overtime-service'
import type { Enums } from '@/types/supabase'

export async function submitOvertimeAction(_prev: unknown, formData: FormData) {
  const { id: tenantId, userId } = await requireTenant()
  const parsed = OvertimeRequestSchema.safeParse({ employee_id: formData.get('employee_id'), date: formData.get('date'), ot_hours: Number(formData.get('ot_hours')), reason: formData.get('reason') })
  if (!parsed.success) return createActionResult(false, undefined, parsed.error.issues?.[0]?.message, toasts.error('Validation failed', parsed.error.issues?.[0]?.message))
  try {
    const ot = await submitOvertimeRequest(tenantId, userId, parsed.data)
    revalidatePath('/hr/overtime')
    return createActionResult(true, { otId: ot.id }, undefined, toasts.success('OT request submitted!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to submit'
    return createActionResult(false, undefined, msg, toasts.error('Submission failed', msg))
  }
}

export async function approveOvertimeAction(otId: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])
  try {
    await approveOvertimeRequest(tenantId, userId, otId)
    revalidatePath('/hr/overtime')
    return createActionResult(true, undefined, undefined, toasts.success('OT request approved!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to approve'
    return createActionResult(false, undefined, msg, toasts.error('Approval failed', msg))
  }
}

export async function rejectOvertimeAction(otId: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])
  const parsed = ApprovalSchema.safeParse({ reason: formData.get('reason') })
  if (!parsed.success) return createActionResult(false, undefined, parsed.error.issues?.[0]?.message, toasts.error('Validation failed', parsed.error.issues?.[0]?.message))
  try {
    await rejectOvertimeRequest(tenantId, userId, otId, parsed.data.reason)
    revalidatePath('/hr/overtime')
    return createActionResult(true, undefined, undefined, toasts.success('OT request rejected!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to reject'
    return createActionResult(false, undefined, msg, toasts.error('Rejection failed', msg))
  }
}
