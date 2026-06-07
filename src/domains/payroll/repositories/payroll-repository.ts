import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type PayrollRun = Database['public']['Tables']['payroll_runs']['Row']
type PayrollItem = Database['public']['Tables']['payroll_items']['Row']
type PayrollPeriod = Database['public']['Tables']['payroll_periods']['Row']

/**
 * Find a payroll run by ID
 */
export async function findPayrollRunById(
  tenantId: string,
  payrollRunId: string,
): Promise<PayrollRun | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', payrollRunId)
    .single()

  return data || null
}

/**
 * Find payroll runs by period
 */
export async function findPayrollRunsByPeriod(
  tenantId: string,
  payrollPeriodId: string,
): Promise<PayrollRun | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('payroll_period_id', payrollPeriodId)
    .single()

  return data || null
}

/**
 * Find all payroll runs by status (draft, processing, generated, finalized)
 */
export async function findPayrollRunsByStatus(
  tenantId: string,
  status: string,
): Promise<PayrollRun[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('payroll_runs')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  return data || []
}

/**
 * Create a new payroll run in DRAFT status
 */
export async function createPayrollRun(
  tenantId: string,
  payrollPeriodId: string,
): Promise<PayrollRun> {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('payroll_runs')
    .insert({
      tenant_id: tenantId,
      payroll_period_id: payrollPeriodId,
      status: 'draft',
      employee_count: 0,
      total_gross_centavos: 0,
      total_net_centavos: 0,
      total_employer_centavos: 0,
      reopen_count: 0,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Update payroll run status
 */
export async function updatePayrollRunStatus(
  tenantId: string,
  payrollRunId: string,
  status: string,
  updates?: Partial<PayrollRun>,
): Promise<PayrollRun> {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('payroll_runs')
    .update({
      status,
      ...updates,
    })
    .eq('tenant_id', tenantId)
    .eq('id', payrollRunId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Insert payroll items (bulk)
 */
export async function insertPayrollItems(
  tenantId: string,
  payrollRunId: string,
  items: Omit<PayrollItem, 'id' | 'created_at' | 'updated_at'>[],
): Promise<PayrollItem[]> {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('payroll_items')
    .insert(
      items.map((item) => ({
        ...item,
        tenant_id: tenantId,
        payroll_run_id: payrollRunId,
      })),
    )
    .select()

  if (error) throw error
  return data || []
}

/**
 * Find payroll items for a run
 */
export async function findPayrollItems(
  tenantId: string,
  payrollRunId: string,
): Promise<PayrollItem[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('payroll_items')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('payroll_run_id', payrollRunId)

  return data || []
}

/**
 * Find payroll item for an employee in a run
 */
export async function findPayrollItem(
  tenantId: string,
  payrollRunId: string,
  employeeId: string,
): Promise<PayrollItem | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('payroll_items')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('payroll_run_id', payrollRunId)
    .eq('employee_id', employeeId)
    .single()

  return data || null
}

/**
 * Update payroll item
 */
export async function updatePayrollItem(
  tenantId: string,
  payrollItemId: string,
  updates: Partial<PayrollItem>,
): Promise<PayrollItem> {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('payroll_items')
    .update(updates)
    .eq('tenant_id', tenantId)
    .eq('id', payrollItemId)
    .select()
    .single()

  if (error) throw error
  return data
}

/**
 * Find payroll period by ID
 */
export async function findPayrollPeriodById(
  tenantId: string,
  periodId: string,
): Promise<PayrollPeriod | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('payroll_periods')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', periodId)
    .single()

  return data || null
}

/**
 * Find payroll periods by status
 */
export async function findPayrollPeriodsByStatus(
  tenantId: string,
  status: string,
): Promise<PayrollPeriod[]> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('payroll_periods')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('status', status)
    .order('start_date', { ascending: false })

  return data || []
}

/**
 * Count payroll runs by status
 */
export async function countPayrollRunsByStatus(tenantId: string): Promise<{
  draft: number
  processing: number
  generated: number
  finalized: number
}> {
  const supabase = await createServerSupabaseClient()

  const statuses = ['draft', 'processing', 'generated', 'finalized'] as const
  const counts = { draft: 0, processing: 0, generated: 0, finalized: 0 }

  for (const status of statuses) {
    const { count, error } = await supabase
      .from('payroll_runs')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', status)

    if (!error && count !== null) {
      counts[status] = count
    }
  }

  return counts
}
