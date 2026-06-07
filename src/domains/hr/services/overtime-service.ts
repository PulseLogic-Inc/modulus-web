import { logAudit } from '@/platform/audit'
import {
  findOvertimeById,
  insertOvertimeRequest,
  updateOvertimeStatus,
} from '@/domains/hr/repositories/overtime-repository'
import { findEmployeeById } from '@/domains/hr/repositories/employee-repository'
import type { OvertimeRequestInput } from '@/domains/hr/types'

/**
 * Submit an overtime request
 *
 * Validates that the employee exists, then creates a pending OT request.
 * Logs audit event.
 *
 * @param tenantId - Tenant ID
 * @param employeeId - Employee requesting OT
 * @param userId - User ID (for audit logging)
 * @param data - OT request data
 */
export async function submitOvertimeRequest(
  tenantId: string,
  employeeId: string,
  userId: string,
  data: OvertimeRequestInput,
) {
  // 1. Verify employee exists
  const employee = await findEmployeeById(tenantId, employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }

  // 2. Validate OT date is not in the past
  const otDate = new Date(data.ot_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (otDate < today) {
    throw new Error('Cannot request overtime for past dates')
  }

  // 3. Create OT request
  const overtime = await insertOvertimeRequest(tenantId, employeeId, userId, {
    ot_date: data.ot_date,
    ot_hours: data.ot_hours,
    ot_type: data.ot_type,
    reason_category: data.reason_category,
    reason_detail: data.reason_detail,
    multiplier: data.multiplier,
  })

  // 4. Log audit
  await logAudit({
    tenantId,
    actor: userId,
    action: 'CREATE',
    entity: 'overtime_requests',
    entityId: overtime.id,
    newValue: overtime,
    reason: `OT request submitted: ${data.ot_hours}h (${data.ot_type}) on ${data.ot_date}`,
  })

  return overtime
}

/**
 * Approve an overtime request
 *
 * Updates the OT status to 'approved' with optional cost estimate.
 * Logs audit event.
 *
 * @param tenantId - Tenant ID
 * @param overtimeId - Overtime ID
 * @param userId - HR Admin user ID (approver)
 * @param costEstimate - Optional cost estimate in centavos
 */
export async function approveOvertimeRequest(
  tenantId: string,
  overtimeId: string,
  userId: string,
  costEstimate?: number,
) {
  // 1. Fetch OT request
  const overtime = await findOvertimeById(tenantId, overtimeId)
  if (!overtime) {
    throw new Error('Overtime request not found')
  }

  if (overtime.status !== 'pending') {
    throw new Error('Only pending OT requests can be approved')
  }

  // 2. Update status to 'approved'
  const approvedOT = await updateOvertimeStatus(
    tenantId,
    overtimeId,
    'approved',
    {
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
      estimated_cost_centavos: costEstimate,
    },
  )

  // 3. Log approval
  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'overtime_requests',
    entityId: overtimeId,
    oldValue: overtime,
    newValue: approvedOT,
    reason: `OT approved: ${overtime.ot_hours}h${costEstimate ? ` @ ₱${(costEstimate / 100).toFixed(2)}` : ''}`,
  })

  return approvedOT
}

/**
 * Reject an overtime request
 *
 * Updates the OT status to 'rejected' with a reason.
 * Logs audit event.
 *
 * @param tenantId - Tenant ID
 * @param overtimeId - Overtime ID
 * @param rejectReason - Reason for rejection
 * @param userId - HR Admin user ID (rejecter)
 */
export async function rejectOvertimeRequest(
  tenantId: string,
  overtimeId: string,
  rejectReason: string,
  userId: string,
) {
  // 1. Fetch OT request
  const overtime = await findOvertimeById(tenantId, overtimeId)
  if (!overtime) {
    throw new Error('Overtime request not found')
  }

  if (overtime.status !== 'pending') {
    throw new Error('Only pending OT requests can be rejected')
  }

  // 2. Update status to 'rejected'
  const rejectedOT = await updateOvertimeStatus(
    tenantId,
    overtimeId,
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
    entity: 'overtime_requests',
    entityId: overtimeId,
    oldValue: overtime,
    newValue: rejectedOT,
    reason: `OT rejected: ${rejectReason}`,
  })

  return rejectedOT
}

/**
 * Get all OT requests for an employee
 */
export async function getEmployeeOvertimeRequests(tenantId: string, employeeId: string) {
  const { findByEmployee } = await import('@/domains/hr/repositories/overtime-repository')
  return findByEmployee(tenantId, employeeId)
}
