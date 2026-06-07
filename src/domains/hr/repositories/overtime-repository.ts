import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type OvertimeRequest = Database['public']['Tables']['overtime_requests']['Row']

/**
 * Find a single overtime request by ID
 */
export async function findOvertimeById(
  tenantId: string,
  overtimeId: string,
): Promise<OvertimeRequest | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('overtime_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', overtimeId)
    .is('deleted_at', null)
    .single()

  return data || null
}

/**
 * Find all pending overtime requests for a tenant (for HR Admin dashboard)
 * @param tenantId - Tenant ID
 * @param limit - Max results (default 20)
 */
export async function findPendingOvertimeRequests(
  tenantId: string,
  limit: number = 20,
): Promise<OvertimeRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('overtime_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')
    .is('deleted_at', null)
    .order('request_date', { ascending: false })
    .limit(limit)

  return data || []
}

/**
 * Find all overtime requests by an employee
 * @param tenantId - Tenant ID
 * @param employeeId - Employee ID
 */
export async function findByEmployee(
  tenantId: string,
  employeeId: string,
): Promise<OvertimeRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('overtime_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('request_date', { ascending: false })

  return data || []
}

/**
 * Find overtime requests by status
 * @param tenantId - Tenant ID
 * @param status - pending | approved | rejected
 */
export async function findByStatus(
  tenantId: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<OvertimeRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('overtime_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', status)
    .is('deleted_at', null)
    .order('request_date', { ascending: false })

  return data || []
}

/**
 * Insert a new overtime request
 */
export async function insertOvertimeRequest(
  tenantId: string,
  employeeId: string,
  userId: string,
  data: {
    ot_date: string
    ot_hours: number
    ot_type: string
    reason_category: string
    reason_detail?: string | null
    multiplier: number
  },
): Promise<OvertimeRequest> {
  const supabase = await createAdminSupabaseClient()
  const { data: inserted, error } = await supabase
    .from('overtime_requests')
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
 * Update overtime request status (approve or reject)
 */
export async function updateOvertimeStatus(
  tenantId: string,
  overtimeId: string,
  status: 'approved' | 'rejected',
  metadata?: Partial<{
    reviewed_by: string
    reviewed_at: string
    estimated_cost_centavos: number
    rejection_reason: string
  }>,
): Promise<OvertimeRequest> {
  const supabase = await createAdminSupabaseClient()
  const { data: updated, error } = await supabase
    .from('overtime_requests')
    .update({
      status,
      ...metadata,
    })
    .eq('tenant_id', tenantId)
    .eq('id', overtimeId)
    .select()
    .single()

  if (error) throw error
  return updated
}

/**
 * Get count of overtime requests by status for dashboard metrics
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
      .from('overtime_requests')
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
 * Soft delete an overtime request
 */
export async function softDeleteOvertime(
  tenantId: string,
  overtimeId: string,
): Promise<void> {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from('overtime_requests')
    .update({ deleted_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', overtimeId)

  if (error) throw error
}
