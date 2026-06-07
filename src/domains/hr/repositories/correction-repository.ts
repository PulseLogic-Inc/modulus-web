import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type CorrectionRequest = Database['public']['Tables']['hr_correction_requests']['Row']

/**
 * Find a single correction request by ID
 */
export async function findCorrectionById(
  tenantId: string,
  correctionId: string,
): Promise<CorrectionRequest | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('hr_correction_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', correctionId)
    .is('deleted_at', null)
    .single()

  return data || null
}

/**
 * Find all pending corrections for a tenant (for HR Admin dashboard)
 * @param tenantId - Tenant ID
 * @param limit - Max results (default 20)
 */
export async function findPendingCorrections(
  tenantId: string,
  limit: number = 20,
): Promise<CorrectionRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('hr_correction_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', 'pending')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

/**
 * Find all corrections by an employee (submitted by them)
 * @param tenantId - Tenant ID
 * @param employeeId - Employee ID
 */
export async function findCorrectionsByEmployee(
  tenantId: string,
  employeeId: string,
): Promise<CorrectionRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('hr_correction_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Find corrections by status (for filtering/reporting)
 * @param tenantId - Tenant ID
 * @param status - pending | approved | rejected
 */
export async function findByStatus(
  tenantId: string,
  status: 'pending' | 'approved' | 'rejected',
): Promise<CorrectionRequest[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('hr_correction_requests')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', status)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Insert a new correction request
 * @param tenantId - Tenant ID
 * @param employeeId - Employee requesting correction
 * @param data - Correction data
 */
export async function insertCorrection(
  tenantId: string,
  employeeId: string,
  data: {
    timekeeping_record_id: string | null
    correction_type: 'clock_in' | 'clock_out' | 'worked_minutes'
    proposed_value: string
    reason: string
  },
): Promise<CorrectionRequest> {
  const supabase = await createAdminSupabaseClient()
  const { data: inserted, error } = await supabase
    .from('hr_correction_requests')
    .insert({
      tenant_id: tenantId,
      employee_id: employeeId,
      ...data,
      status: 'pending',
    })
    .select()
    .single()

  if (error) throw error
  return inserted
}

/**
 * Update correction status (approve or reject)
 * @param tenantId - Tenant ID
 * @param correctionId - Correction ID
 * @param status - New status (approved or rejected)
 * @param metadata - Optional metadata (approved_by, approved_at, rejection_reason)
 */
export async function updateCorrectionStatus(
  tenantId: string,
  correctionId: string,
  status: 'approved' | 'rejected',
  metadata?: Partial<{
    approved_by: string
    approved_at: string
    rejection_reason: string
  }>,
): Promise<CorrectionRequest> {
  const supabase = await createAdminSupabaseClient()
  const { data: updated, error } = await supabase
    .from('hr_correction_requests')
    .update({
      status,
      ...metadata,
    })
    .eq('tenant_id', tenantId)
    .eq('id', correctionId)
    .select()
    .single()

  if (error) throw error
  return updated
}

/**
 * Get count of corrections by status for dashboard metrics
 * @param tenantId - Tenant ID
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
      .from('hr_correction_requests')
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
 * Soft delete a correction request
 * @param tenantId - Tenant ID
 * @param correctionId - Correction ID
 */
export async function softDeleteCorrection(
  tenantId: string,
  correctionId: string,
): Promise<void> {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from('hr_correction_requests')
    .update({ deleted_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', correctionId)

  if (error) throw error
}
