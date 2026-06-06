import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import type { TimekeepingStatus } from '@/domains/timekeeping/types'

type TimekeepingRecord = Database['public']['Tables']['timekeeping_records']['Row']

/**
 * Find a timekeeping record by employee and date
 * @param tenantId - Tenant ID
 * @param employeeId - Employee ID
 * @param date - Date in YYYY-MM-DD format
 * @returns TimekeepingRecord or null if not found
 */
export async function findRecordByDate(
  tenantId: string,
  employeeId: string,
  date: string,
): Promise<TimekeepingRecord | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('timekeeping_records')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)
    .eq('date', date)
    .single()

  if (error?.code === 'PGRST116') return null // No rows found
  if (error) throw error
  return data
}

/**
 * Find all timekeeping records for an employee in a date range
 * @param tenantId - Tenant ID
 * @param employeeId - Employee ID
 * @param fromDate - Start date (YYYY-MM-DD)
 * @param toDate - End date (YYYY-MM-DD)
 * @returns Array of TimekeepingRecords
 */
export async function findRecordsByDateRange(
  tenantId: string,
  employeeId: string,
  fromDate: string,
  toDate: string,
): Promise<TimekeepingRecord[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('timekeeping_records')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('employee_id', employeeId)
    .gte('date', fromDate)
    .lte('date', toDate)
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Find incomplete or flagged timekeeping records for a tenant
 * Used for anomaly alerts and payroll verification
 * @param tenantId - Tenant ID
 * @param fromDate - Start date (YYYY-MM-DD)
 * @returns Array of incomplete/flagged records
 */
export async function findIncompleteRecords(
  tenantId: string,
  fromDate: string,
): Promise<TimekeepingRecord[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('timekeeping_records')
    .select('*')
    .eq('tenant_id', tenantId)
    .in('status', ['incomplete', 'missing_clock'])
    .gte('date', fromDate)
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Find flagged timekeeping records for anomaly detection
 * @param tenantId - Tenant ID
 * @returns Array of flagged records
 */
export async function findFlaggedRecords(tenantId: string): Promise<TimekeepingRecord[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('timekeeping_records')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('auto_flagged', true)
    .order('date', { ascending: false })

  if (error) throw error
  return data ?? []
}

/**
 * Insert a new timekeeping record
 * @param data - Record data to insert
 * @returns Inserted TimekeepingRecord
 */
export async function insertRecord(
  data: Omit<TimekeepingRecord, 'id' | 'created_at' | 'updated_at'>,
): Promise<TimekeepingRecord> {
  const supabase = await createServerSupabaseClient()
  const { data: inserted, error } = await supabase
    .from('timekeeping_records')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return inserted
}

/**
 * Update a timekeeping record
 * @param tenantId - Tenant ID
 * @param id - Record ID
 * @param data - Partial data to update
 * @returns Updated TimekeepingRecord
 */
export async function updateRecord(
  tenantId: string,
  id: string,
  data: Partial<Omit<TimekeepingRecord, 'id' | 'created_at' | 'updated_at'>>,
): Promise<TimekeepingRecord> {
  const supabase = await createServerSupabaseClient()
  const { data: updated, error } = await supabase
    .from('timekeeping_records')
    .update(data)
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated
}

/**
 * Get timekeeping summary for a tenant on a specific date
 * Useful for dashboard/summary views
 * @param tenantId - Tenant ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Summary: complete, incomplete, flagged counts
 */
export async function getDaySummary(
  tenantId: string,
  date: string,
): Promise<{ complete: number; incomplete: number; flagged: number }> {
  const supabase = await createServerSupabaseClient()

  const [completeResult, incompleteResult, flaggedResult] = await Promise.all([
    supabase
      .from('timekeeping_records')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('date', date)
      .eq('status', 'complete'),
    supabase
      .from('timekeeping_records')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('date', date)
      .in('status', ['incomplete', 'missing_clock']),
    supabase
      .from('timekeeping_records')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('date', date)
      .eq('auto_flagged', true),
  ])

  return {
    complete: completeResult.count ?? 0,
    incomplete: incompleteResult.count ?? 0,
    flagged: flaggedResult.count ?? 0,
  }
}
