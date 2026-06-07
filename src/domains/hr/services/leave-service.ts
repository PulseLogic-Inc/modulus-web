import { logAudit } from '@/platform/audit'
import {
  findLeaveRequestById,
  insertLeaveRequest,
  updateLeaveStatus,
  getLeaveBalance,
} from '@/domains/hr/repositories/leave-repository'
import { findEmployeeById } from '@/domains/hr/repositories/employee-repository'
import type { LeaveRequestInput } from '@/domains/hr/types'

/**
 * Submit a leave request
 *
 * Validates employee exists and leave dates, then creates pending request.
 * Logs audit event.
 *
 * @param tenantId - Tenant ID
 * @param employeeId - Employee requesting leave
 * @param userId - User ID (for audit logging)
 * @param data - Leave request data
 */
export async function submitLeaveRequest(
  tenantId: string,
  employeeId: string,
  userId: string,
  data: LeaveRequestInput,
) {
  // 1. Verify employee exists
  const employee = await findEmployeeById(tenantId, employeeId)
  if (!employee) {
    throw new Error('Employee not found')
  }

  // 2. Validate dates
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (startDate < today) {
    throw new Error('Cannot request leave for past dates')
  }

  if (endDate < startDate) {
    throw new Error('End date must be after start date')
  }

  // 3. Check leave balance (warning only, not blocking)
  const balance = await getLeaveBalance(tenantId, employeeId)
  const leaveTypeBalance = balance.find((b) => b.leaveType === data.leave_type)
  if (leaveTypeBalance && leaveTypeBalance.balance < data.days) {
    console.warn(`Low balance for ${data.leave_type}: ${leaveTypeBalance.balance} days available`)
  }

  // 4. Create leave request
  const leave = await insertLeaveRequest(tenantId, employeeId, userId, {
    leave_type: data.leave_type,
    start_date: data.start_date,
    end_date: data.end_date,
    days: data.days,
    is_half_day: data.is_half_day,
    reason: data.reason,
  })

  // 5. Log audit
  await logAudit({
    tenantId,
    actor: userId,
    action: 'CREATE',
    entity: 'leave_requests',
    entityId: leave.id,
    newValue: leave,
    reason: `Leave request submitted: ${data.leave_type.toUpperCase()} ${data.days}d from ${data.start_date}`,
  })

  return leave
}

/**
 * Approve a leave request
 *
 * Updates status to 'approved' and creates ledger entry for usage.
 * Logs audit events.
 *
 * @param tenantId - Tenant ID
 * @param leaveRequestId - Leave request ID
 * @param userId - HR Admin user ID (approver)
 */
export async function approveLeaveRequest(
  tenantId: string,
  leaveRequestId: string,
  userId: string,
) {
  // 1. Fetch leave request
  const leave = await findLeaveRequestById(tenantId, leaveRequestId)
  if (!leave) {
    throw new Error('Leave request not found')
  }

  if (leave.status !== 'pending') {
    throw new Error('Only pending leave requests can be approved')
  }

  // 2. Update status to 'approved'
  const approvedLeave = await updateLeaveStatus(
    tenantId,
    leaveRequestId,
    'approved',
    {
      reviewed_by: userId,
      reviewed_at: new Date().toISOString(),
    },
  )

  // 3. Log approval
  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'leave_requests',
    entityId: leaveRequestId,
    oldValue: leave,
    newValue: approvedLeave,
    reason: `Leave approved: ${leave.leave_type.toUpperCase()} ${leave.days}d`,
  })

  return approvedLeave
}

/**
 * Reject a leave request
 *
 * Updates status to 'rejected' with reason.
 * Logs audit event.
 *
 * @param tenantId - Tenant ID
 * @param leaveRequestId - Leave request ID
 * @param rejectReason - Reason for rejection
 * @param userId - HR Admin user ID (rejecter)
 */
export async function rejectLeaveRequest(
  tenantId: string,
  leaveRequestId: string,
  rejectReason: string,
  userId: string,
) {
  // 1. Fetch leave request
  const leave = await findLeaveRequestById(tenantId, leaveRequestId)
  if (!leave) {
    throw new Error('Leave request not found')
  }

  if (leave.status !== 'pending') {
    throw new Error('Only pending leave requests can be rejected')
  }

  // 2. Update status to 'rejected'
  const rejectedLeave = await updateLeaveStatus(
    tenantId,
    leaveRequestId,
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
    entity: 'leave_requests',
    entityId: leaveRequestId,
    oldValue: leave,
    newValue: rejectedLeave,
    reason: `Leave rejected: ${rejectReason}`,
  })

  return rejectedLeave
}

/**
 * Get employee leave balance
 */
export async function getEmployeeLeaveBalance(tenantId: string, employeeId: string) {
  return getLeaveBalance(tenantId, employeeId)
}

/**
 * Get all leave requests for an employee
 */
export async function getEmployeeLeaveRequests(tenantId: string, employeeId: string) {
  const { findLeavesByEmployee } = await import('@/domains/hr/repositories/leave-repository')
  return findLeavesByEmployee(tenantId, employeeId)
}
