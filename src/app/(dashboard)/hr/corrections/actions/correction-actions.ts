'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { CorrectionRequestSchema, ApprovalSchema } from '@/domains/hr/types'
import { toasts, createActionResult } from '@/lib/toast-server'
import { submitCorrection, approveCorrection, rejectCorrection } from '@/domains/hr/services/correction-service'
import type { Enums } from '@/types/supabase'

export async function submitCorrectionAction(_prev: unknown, formData: FormData) {
  const { id: tenantId, userId } = await requireTenant()
  const parsed = CorrectionRequestSchema.safeParse({
    timekeeping_record_id: formData.get('timekeeping_record_id'),
    correction_type: formData.get('correction_type'),
    proposed_value: formData.get('proposed_value'),
    reason: formData.get('reason'),
  })
  if (!parsed.success) return createActionResult(false, undefined, parsed.error.issues?.[0]?.message, toasts.error('Validation failed', parsed.error.issues?.[0]?.message))
  try {
    const correction = await submitCorrection(tenantId, userId, userId, parsed.data)
    revalidatePath('/hr/corrections')
    return createActionResult(true, { correctionId: correction.id }, undefined, toasts.success('Correction submitted!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to submit'
    return createActionResult(false, undefined, msg, toasts.error('Submission failed', msg))
  }
}

export async function approveCorrectionAction(correctionId: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])
  try {
    await approveCorrection(tenantId, userId, correctionId)
    revalidatePath('/hr/corrections')
    return createActionResult(true, undefined, undefined, toasts.success('Correction approved!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to approve'
    return createActionResult(false, undefined, msg, toasts.error('Approval failed', msg))
  }
}

export async function rejectCorrectionAction(correctionId: string, _prev: unknown, formData: FormData) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])
  const parsed = ApprovalSchema.safeParse({ reason: formData.get('reason') })
  if (!parsed.success) return createActionResult(false, undefined, parsed.error.issues?.[0]?.message, toasts.error('Validation failed', parsed.error.issues?.[0]?.message))
  try {
    await rejectCorrection(tenantId, userId, correctionId, parsed.data.reason)
    revalidatePath('/hr/corrections')
    return createActionResult(true, undefined, undefined, toasts.success('Correction rejected!'))
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Failed to reject'
    return createActionResult(false, undefined, msg, toasts.error('Rejection failed', msg))
  }
}
