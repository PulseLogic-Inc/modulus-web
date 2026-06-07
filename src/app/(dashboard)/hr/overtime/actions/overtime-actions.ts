'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { OvertimeRequestSchema, OvertimeApprovalSchema } from '@/domains/hr/types'
import {
  submitOvertimeRequest,
  approveOvertimeRequest,
  rejectOvertimeRequest,
} from '@/domains/hr/services/overtime-service'
import type { Enums } from '@/types/supabase'

/**
 * Submit a new overtime request
 * Anyone in the tenant can submit OT requests
 */
export async function submitOvertimeAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string; overtimeId?: string } | null> {
  const { id: tenantId, userId } = await requireTenant()

  const parsed = OvertimeRequestSchema.safeParse({
    request_date: formData.get('request_date'),
    requested_hours: Number(formData.get('requested_hours')),
    reason: formData.get('reason'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  try {
    const overtime = await submitOvertimeRequest(tenantId, userId, userId, parsed.data)

    revalidatePath('/hr/overtime')
    return { overtimeId: overtime.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to submit overtime request' }
  }
}

/**
 * Approve an overtime request
 * Only HR Admin or Owner can approve
 */
export async function approveOvertimeAction(
  overtimeId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const costEstimate = formData.get('cost_estimate_centavos')
  const costEstimateCentavos = costEstimate ? Number(costEstimate) : undefined

  try {
    await approveOvertimeRequest(tenantId, overtimeId, userId, costEstimateCentavos)

    revalidatePath('/hr/overtime')
    return null
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to approve overtime request' }
  }
}

/**
 * Reject an overtime request
 * Only HR Admin or Owner can reject
 */
export async function rejectOvertimeAction(
  overtimeId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = OvertimeApprovalSchema.safeParse({
    overtime_id: overtimeId,
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
    await rejectOvertimeRequest(tenantId, overtimeId, rejection_reason, userId)

    revalidatePath('/hr/overtime')
    return null
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to reject overtime request' }
  }
}
