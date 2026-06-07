import { logAudit } from '@/platform/audit'
import {
  findCorrectionById,
  insertCorrection,
  updateCorrectionStatus,
} from '@/domains/hr/repositories/correction-repository'
import {
  findRecordByDate,
  updateRecord as updateTimekeepingRecord,
} from '@/domains/timekeeping/repositories/timekeeping-repository'
import type { CorrectionRequestInput } from '@/domains/hr/types'

/**
 * Submit a correction request
 *
 * Validates that the timekeeping record exists, then creates a pending correction request.
 * Logs audit event.
 *
 * @param tenantId - Tenant ID
 * @param employeeId - Employee submitting the correction
 * @param userId - User ID (for audit logging)
 * @param data - Correction request data
 */
export async function submitCorrection(
  tenantId: string,
  employeeId: string,
  userId: string,
  data: CorrectionRequestInput,
) {
  // 1. Verify timekeeping record exists
  if (data.timekeeping_record_id) {
    const record = await findRecordByDate(tenantId, employeeId, data.timekeeping_record_id as any)
    if (!record) {
      throw new Error('Timekeeping record not found')
    }
  }

  // 2. Create correction request
  const correction = await insertCorrection(tenantId, employeeId, {
    timekeeping_record_id: data.timekeeping_record_id || null,
    correction_type: data.correction_type,
    proposed_value: data.proposed_value,
    reason: data.reason,
  })

  // 3. Log audit
  await logAudit({
    tenantId,
    actor: userId,
    action: 'CREATE',
    entity: 'hr_correction_requests',
    entityId: correction.id,
    newValue: correction,
    reason: `Correction request submitted: ${data.correction_type} on ${data.timekeeping_record_id}`,
  })

  return correction
}

/**
 * Approve a correction request
 *
 * Updates the correction status to 'approved' and applies the change to the timekeeping record.
 * Logs audit events on both tables.
 *
 * @param tenantId - Tenant ID
 * @param correctionId - Correction ID
 * @param userId - HR Admin user ID (approver)
 */
export async function approveCorrection(
  tenantId: string,
  correctionId: string,
  userId: string,
) {
  // 1. Fetch correction
  const correction = await findCorrectionById(tenantId, correctionId)
  if (!correction) {
    throw new Error('Correction request not found')
  }

  if (correction.status !== 'pending') {
    throw new Error('Only pending corrections can be approved')
  }

  // 2. Apply correction to timekeeping record (if linked)
  if (correction.timekeeping_record_id) {
    const oldRecord = await findRecordByDate(
      tenantId,
      correction.employee_id,
      correction.timekeeping_record_id as any,
    )
    if (!oldRecord) {
      throw new Error('Linked timekeeping record not found')
    }

    // 3. Update timekeeping record with correction
    const updateData: Record<string, any> = {}
    switch (correction.correction_type) {
      case 'clock_in':
        updateData.clock_in = correction.proposed_value
        break
      case 'clock_out':
        updateData.clock_out = correction.proposed_value
        break
      case 'worked_minutes':
        updateData.worked_minutes = Number(correction.proposed_value)
        break
    }

    const updatedRecord = await updateTimekeepingRecord(
      tenantId,
      correction.timekeeping_record_id,
      updateData,
    )

    // Log timekeeping record update
    await logAudit({
      tenantId,
      actor: userId,
      action: 'UPDATE',
      entity: 'timekeeping_records',
      entityId: correction.timekeeping_record_id,
      oldValue: oldRecord,
      newValue: updatedRecord,
      reason: `Correction approved (${correction.correction_type}): ${correction.proposed_value}`,
    })
  }

  // 4. Update correction status to 'approved'
  const approvedCorrection = await updateCorrectionStatus(
    tenantId,
    correctionId,
    'approved',
    {
      approved_by: userId,
      approved_at: new Date().toISOString(),
    },
  )

  // 5. Log correction approval
  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'hr_correction_requests',
    entityId: correctionId,
    oldValue: correction,
    newValue: approvedCorrection,
    reason: 'Correction approved',
  })

  return approvedCorrection
}

/**
 * Reject a correction request
 *
 * Updates the correction status to 'rejected' with an optional reason.
 * Logs audit event.
 *
 * @param tenantId - Tenant ID
 * @param correctionId - Correction ID
 * @param rejectReason - Reason for rejection
 * @param userId - HR Admin user ID (rejecter)
 */
export async function rejectCorrection(
  tenantId: string,
  correctionId: string,
  rejectReason: string,
  userId: string,
) {
  // 1. Fetch correction
  const correction = await findCorrectionById(tenantId, correctionId)
  if (!correction) {
    throw new Error('Correction request not found')
  }

  if (correction.status !== 'pending') {
    throw new Error('Only pending corrections can be rejected')
  }

  // 2. Update status to 'rejected'
  const rejectedCorrection = await updateCorrectionStatus(
    tenantId,
    correctionId,
    'rejected',
    {
      rejection_reason: rejectReason,
    },
  )

  // 3. Log rejection
  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'hr_correction_requests',
    entityId: correctionId,
    oldValue: correction,
    newValue: rejectedCorrection,
    reason: `Correction rejected: ${rejectReason}`,
  })

  return rejectedCorrection
}

/**
 * Get all corrections for an employee (for their profile)
 */
export async function getEmployeeCorrections(tenantId: string, employeeId: string) {
  const { findCorrectionsByEmployee } = await import('@/domains/hr/repositories/correction-repository')
  return findCorrectionsByEmployee(tenantId, employeeId)
}
