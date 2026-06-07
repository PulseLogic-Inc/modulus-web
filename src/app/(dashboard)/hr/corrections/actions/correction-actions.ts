'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { CorrectionRequestSchema, ApprovalSchema } from '@/domains/hr/types'
import {
  submitCorrection,
  approveCorrection,
  rejectCorrection,
} from '@/domains/hr/services/correction-service'
import type { Enums } from '@/types/supabase'

/**
 * Submit a new correction request
 * Anyone in the tenant can submit corrections for themselves
 */
export async function submitCorrectionAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string; correctionId?: string } | null> {
  const { id: tenantId, userId } = await requireTenant()

  const parsed = CorrectionRequestSchema.safeParse({
    timekeeping_record_id: formData.get('timekeeping_record_id'),
    correction_type: formData.get('correction_type'),
    proposed_value: formData.get('proposed_value'),
    reason: formData.get('reason'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  try {
    const correction = await submitCorrection(tenantId, userId, userId, parsed.data)

    revalidatePath('/hr/corrections')
    return { correctionId: correction.id }
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to submit correction' }
  }
}

/**
 * Approve a correction request
 * Only HR Admin or Owner can approve
 */
export async function approveCorrectionAction(
  correctionId: string,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  try {
    await approveCorrection(tenantId, correctionId, userId)

    revalidatePath('/hr/corrections')
    return null
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to approve correction' }
  }
}

/**
 * Reject a correction request with a reason
 * Only HR Admin or Owner can reject
 */
export async function rejectCorrectionAction(
  correctionId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = ApprovalSchema.safeParse({
    correction_id: correctionId,
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
    await rejectCorrection(tenantId, correctionId, rejection_reason, userId)

    revalidatePath('/hr/corrections')
    return null
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to reject correction' }
  }
}
