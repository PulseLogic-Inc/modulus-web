import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']
type LeaveBalance = {
  leaveType: string
  earned: number
  used: number
  carryover: number
  balance: number
}

/**
 * Find a single leave request by ID
 */
export async function findLeaveRequestById(
  tenantId: string,
  leaveRequestId: string,
): Promise<LeaveRequest | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', leaveRequestId)
    .is('deleted_at', null)
    .single()

  return data || null
}

/**
 * Find all pending leave requests for a tenant
 */
export async function findPendingLeaveRequests(
  tenantId: string,
  limit: number = 20,
): Promise<LeaveRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')
    .is('deleted_at', null)
    .order('start_date', { ascending: true })
    .limit(limit)

  return data || []
}

/**
 * Find all leave requests by an employee
 */
export async function findLeavesByEmployee(
  tenantId: string,
  employeeId: string,
): Promise<LeaveRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })

  return data || []
}

/**
 * Find leave requests by status
 */
export async function findByStatus(
  tenantId: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<LeaveRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('leave_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', status)
    .is('deleted_at', null)
    .order('start_date', { ascending: false })

  return data || []
}

/**
 * Insert a new leave request
 */
export async function insertLeaveRequest(
  tenantId: string,
  employeeId: string,
  userId: string,
  data: {
    leave_type: string
    start_date: string
    end_date: string
    days: number
    is_half_day: boolean
    reason: string
  },
): Promise<LeaveRequest> {
  const supabase = await createAdminSupabaseClient()
  const { data: inserted, error } = await supabase
    .from('leave_requests')
    .insert({
      tenant_id: tenantId,
      employee_id: employeeId,
      requested_by: userId,
      ...data,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return inserted
}

/**
 * Update leave request status (approve or reject)
 */
export async function updateLeaveStatus(
  tenantId: string,
  leaveRequestId: string,
  status: 'approved' | 'rejected',
  metadata?: Partial<{
    reviewed_by: string
    reviewed_at: string
    rejection_reason: string
  }>,
): Promise<LeaveRequest> {
  const supabase = await createAdminSupabaseClient()
  const { data: updated, error } = await supabase
    .from('leave_requests')
    .update({
      status,
      ...metadata,
    })
    .eq('tenant_id', tenantId)
    .eq('id', leaveRequestId)
    .select()
    .single()

  if (error) throw error
  return updated
}

/**
 * Get leave balance for an employee
 * Calculates from leave_ledger: earned - used + carryover
 */
export async function getLeaveBalance(
  tenantId: string,
  employeeId: string,
): Promise<LeaveBalance[]> {
  const supabase = await createServerSupabaseClient()
  const { data: ledger } = await supabase
    .from('leave_ledger')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)

  if (!ledger) return []

  // Group by leave_type and calculate balance
  const balances: Record<string, { earned: number; used: number; carryover: number }> = {}

  ledger.forEach((entry) => {
    if (!balances[entry.leave_type]) {
      balances[entry.leave_type] = { earned: 0, used: 0, carryover: 0 }
    }

    const balance = balances[entry.leave_type]
    switch (entry.entry_type) {
      case 'accrual':
        balance.earned += entry.days
        break
      case 'usage':
        balance.used += Math.abs(entry.days) // usage is stored as negative
        break
      case 'carryover':
        balance.carryover += entry.days
        break
    }
  })

  // Convert to array with calculated balance
  return Object.entries(balances).map(([leaveType, { earned, used, carryover }]) => ({
    leaveType,
    earned,
    used,
    carryover,
    balance: earned - used + carryover,
  }))
}

/**
 * Count leave requests by status
 */
export async function countByStatus(tenantId: string): Promise<{
  pending: number
  approved: number
  rejected: number
}> {
  const supabase = await createServerSupabaseClient()

  const statuses = ['pending', 'approved', 'rejected'] as const
  const counts = { pending: 0, approved: 0, rejected: 0 }

  for (const status of statuses) {
    const { count, error } = await supabase
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', status)
      .is('deleted_at', null)

    if (!error && count !== null) {
      counts[status] = count
    }
  }

  return counts
}

/**
 * Soft delete a leave request
 */
export async function softDeleteLeaveRequest(
  tenantId: string,
  leaveRequestId: string,
): Promise<void> {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from('leave_requests')
    .update({ deleted_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', leaveRequestId)

  if (error) throw error
}
