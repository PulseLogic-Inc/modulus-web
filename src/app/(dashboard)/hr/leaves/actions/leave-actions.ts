'use server'
import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { LeaveRequestSchema, ApprovalSchema } from '@/domains/hr/types'
import { toasts, createActionResult } from '@/lib/toast-server'
import { submitLeaveRequest, approveLeaveRequest, rejectLeaveRequest } from '@/domains/hr/services/leave-service'
import type { Enums } from '@/types/supabase'

export async function submitLeaveAction(_prev: unknown, formData: FormData) {
  const { id: tenantId, userId } = await requireTenant()
  const parsed = LeaveRequestSchema.safeParse({ leave_type: formData.get('leave_type'), start_date: formData.get('start_date'), end_date: formData.get('end_date'), reason: formData.get('reason') })
  if (!parsed.success) return createActionResult(false, undefined, parsed.error.issues?.[0]?.message, toasts.error('Validation failed', parsed.error.issues?.[0]?.message))
  try {
    const leave = await submitLeaveRequest(tenantId, userId, parsed.data)
    revalidatePath('/hr/leaves')
    return createActionResult(true, { leaveId: leave.id }, undefined, toasts.success('Leave request submitted!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to submit'
    return createActionResult(false, undefined, msg, toasts.error('Submission failed', msg))
  }
}

export async function approveLeaveAction(leaveId: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])
  try {
    await approveLeaveRequest(tenantId, userId, leaveId)
    revalidatePath('/hr/leaves')
    return createActionResult(true, undefined, undefined, toasts.success('Leave request approved!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to approve'
    return createActionResult(false, undefined, msg, toasts.error('Approval failed', msg))
  }
}

export async function rejectLeaveAction(leaveId: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])
  const parsed = ApprovalSchema.safeParse({ reason: formData.get('reason') })
  if (!parsed.success) return createActionResult(false, undefined, parsed.error.issues?.[0]?.message, toasts.error('Validation failed', parsed.error.issues?.[0]?.message))
  try {
    await rejectLeaveRequest(tenantId, userId, leaveId, parsed.data.reason)
    revalidatePath('/hr/leaves')
    return createActionResult(true, undefined, undefined, toasts.success('Leave request rejected!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to reject'
    return createActionResult(false, undefined, msg, toasts.error('Rejection failed', msg))
  }
}
