import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import type { ContractType, ContractStatus } from '@/domains/contracts/types'

type EmploymentContract = Database['public']['Tables']['employment_contracts']['Row']

/**
 * Find all contracts for an employee (active + history)
 * @param tenantId - Tenant ID
 * @param employeeId - Employee ID
 * @returns Array of contracts (newest first)
 */
export async function findContractsByEmployee(
  tenantId: string,
  employeeId: string,
): Promise<EmploymentContract[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employment_contracts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .order('effective_from', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Find the active/current contract for an employee
 * Active = most recent non-superseded, non-voided contract
 * @param tenantId - Tenant ID
 * @param employeeId - Employee ID
 * @returns EmploymentContract or null if no active contract
 */
export async function findActiveContract(
  tenantId: string,
  employeeId: string,
): Promise<EmploymentContract | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employment_contracts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)
    .is('deleted_at', null)
    .in('status', ['draft', 'issued', 'signed']) // Active statuses
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()

  if (error?.code === 'PGRST116') return null // No rows found
  if (error) throw error
  return data
}

/**
 * Find a contract by ID
 * @param tenantId - Tenant ID
 * @param contractId - Contract ID
 * @returns EmploymentContract or null
 */
export async function findContractById(
  tenantId: string,
  contractId: string,
): Promise<EmploymentContract | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employment_contracts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', contractId)
    .is('deleted_at', null)
    .single()

  if (error?.code === 'PGRST116') return null
  if (error) throw error
  return data
}

/**
 * Insert a new contract
 * @param data - Contract data to insert
 * @returns Inserted EmploymentContract
 */
export async function insertContract(
  data: Omit<EmploymentContract, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>,
): Promise<EmploymentContract> {
  const supabase = await createAdminSupabaseClient()
  const { data: inserted, error } = await supabase
    .from('employment_contracts')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return inserted
}

/**
 * Update contract status (draft → issued → signed → superseded/voided)
 * @param tenantId - Tenant ID
 * @param contractId - Contract ID
 * @param status - New status
 * @param metadata - Optional metadata (issued_at, issued_by, voided_at, voided_by, void_reason, storage_path)
 * @returns Updated EmploymentContract
 */
export async function updateContractStatus(
  tenantId: string,
  contractId: string,
  status: ContractStatus,
  metadata?: Partial<{
    issued_at: string
    issued_by: string
    voided_at: string
    voided_by: string
    void_reason: string
    storage_path: string
  }>,
): Promise<EmploymentContract> {
  const supabase = await createAdminSupabaseClient()
  const { data: updated, error } = await supabase
    .from('employment_contracts')
    .update({
      status,
      ...metadata,
    })
    .eq('tenant_id', tenantId)
    .eq('id', contractId)
    .select()
    .single()

  if (error) throw error
  return updated
}

/**
 * Soft delete a contract
 * @param tenantId - Tenant ID
 * @param contractId - Contract ID
 */
export async function softDeleteContract(tenantId: string, contractId: string): Promise<void> {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from('employment_contracts')
    .update({ deleted_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', contractId)

  if (error) throw error
}

/**
 * Mark a contract as superseded (when a new contract is issued)
 * @param tenantId - Tenant ID
 * @param contractId - Old contract ID
 */
export async function supersedContract(tenantId: string, contractId: string): Promise<void> {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from('employment_contracts')
    .update({ status: 'superseded' as any })
    .eq('tenant_id', tenantId)
    .eq('id', contractId)

  if (error) throw error
}

/**
 * Get contracts by status (for filtering/reporting)
 * @param tenantId - Tenant ID
 * @param status - Contract status
 * @returns Array of contracts
 */
export async function findContractsByStatus(
  tenantId: string,
  status: ContractStatus,
): Promise<EmploymentContract[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employment_contracts')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', status)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Count total contracts by status (for dashboard)
 * @param tenantId - Tenant ID
 * @returns Object with status counts
 */
export async function countContractsByStatus(
  tenantId: string,
): Promise<Record<ContractStatus, number>> {
  const supabase = await createServerSupabaseClient()

  const statuses: ContractStatus[] = ['draft', 'issued', 'signed', 'superseded', 'voided']
  const counts: Record<ContractStatus, number> = {} as any

  for (const status of statuses) {
    const { count, error } = await supabase
      .from('employment_contracts')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', status)
      .is('deleted_at', null)

    if (error) throw error
    counts[status] = count ?? 0
  }

  return counts
}
