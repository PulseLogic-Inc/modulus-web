'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { LeaveRequestSchema, LeaveApprovalSchema } from '@/domains/hr/types'
import {
  submitLeaveRequest,
  approveLeaveRequest,
  rejectLeaveRequest,
} from '@/domains/hr/services/leave-service'
import type { Enums } from '@/types/supabase'

/**
 * Submit a new leave request
 * Anyone in the tenant can submit leave requests
 */
export async function submitLeaveAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string; leaveRequestId?: string } | null> {
  const { id: tenantId, userId } = await requireTenant()

  const parsed = LeaveRequestSchema.safeParse({
    leave_type: formData.get('leave_type'),
    start_date: formData.get('start_date'),
    end_date: formData.get('end_date'),
    days: Number(formData.get('days')),
    is_half_day: formData.get('is_half_day') === 'on',
    reason: formData.get('reason'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  try {
    const leave = await submitLeaveRequest(tenantId, userId, userId, parsed.data)

    revalidatePath('/hr/leaves')
    return { leaveRequestId: leave.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to submit leave request' }
  }
}

/**
 * Approve a leave request
 * Only HR Admin or Owner can approve
 */
export async function approveLeaveAction(leaveRequestId: string): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  try {
    await approveLeaveRequest(tenantId, leaveRequestId, userId)

    revalidatePath('/hr/leaves')
    return null
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to approve leave request' }
  }
}

/**
 * Reject a leave request
 * Only HR Admin or Owner can reject
 */
export async function rejectLeaveAction(
  leaveRequestId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = LeaveApprovalSchema.safeParse({
    leave_request_id: leaveRequestId,
    approval_status: 'rejected',
    rejection_reason: formData.get('rejection_reason'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  const { rejection_reason } = parsed.data

  if (!rejection_reason || rejection_reason.length < 10) {
    return { error: 'Rejection reason must be at least 10 characters' }
  }

  try {
    await rejectLeaveRequest(tenantId, leaveRequestId, rejection_reason, userId)

    revalidatePath('/hr/leaves')
    return null
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to reject leave request' }
  }
}
