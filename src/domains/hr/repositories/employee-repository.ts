import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import type { EmployeeInput, EmployeeStatus } from '@/domains/hr/types'

type EmployeeRow        = Database['public']['Tables']['employees']['Row']
type EmployeeInsert     = Database['public']['Tables']['employees']['Insert']

export interface EmployeeFilters {
  search?:          string
  status?:          EmployeeStatus
  work_location_id?: string
  employment_type?: string
  limit?:           number
  offset?:          number
}

export async function findAllEmployees(
  tenantId: string,
  filters: EmployeeFilters = {},
): Promise<EmployeeRow[]> {
  const supabase = await createServerSupabaseClient()
  const limit  = filters.limit  ?? 20
  const offset = filters.offset ?? 0

  let query = supabase
    .from('employees')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('first_name')
    .range(offset, offset + limit - 1)

  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,employee_number.ilike.%${filters.search}%`
    )
  }
  if (filters.status)           query = query.eq('status', filters.status)
  if (filters.work_location_id) query = query.eq('work_location_id', filters.work_location_id)
  if (filters.employment_type)  query = query.eq('employment_type', filters.employment_type)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function countEmployees(
  tenantId: string,
  filters: Omit<EmployeeFilters, 'limit' | 'offset'> = {},
): Promise<number> {
  const supabase = await createServerSupabaseClient()
  let query = supabase
    .from('employees')
    .select('id', { count: 'exact', head: true })
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)

  if (filters.search) {
    query = query.or(
      `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,employee_number.ilike.%${filters.search}%`
    )
  }
  if (filters.status)           query = query.eq('status', filters.status)
  if (filters.work_location_id) query = query.eq('work_location_id', filters.work_location_id)
  if (filters.employment_type)  query = query.eq('employment_type', filters.employment_type)

  const { count, error } = await query
  if (error) throw error
  return count ?? 0
}

export async function findEmployeeById(tenantId: string, id: string): Promise<EmployeeRow | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (error) return null
  return data
}

export async function findLastEmployeeNumber(tenantId: string, year: number): Promise<number> {
  const supabase = await createServerSupabaseClient()
  const prefix = `${year}-`
  const { data } = await supabase
    .from('employees')
    .select('employee_number')
    .eq('tenant_id', tenantId)
    .like('employee_number', `${prefix}%`)
    .order('employee_number', { ascending: false })
    .limit(1)
    .single()

  if (!data) return 0
  const seq = parseInt(data.employee_number.split('-')[1] ?? '0', 10)
  return isNaN(seq) ? 0 : seq
}

export async function insertEmployee(
  tenantId: string,
  data: Omit<EmployeeInsert, 'tenant_id'>,
): Promise<EmployeeRow> {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('employees')
    .insert({ tenant_id: tenantId, ...data })
    .select()
    .single()
  if (error) throw error
  return row
}

export async function updateEmployee(
  tenantId: string,
  id: string,
  data: Partial<EmployeeInput>,
): Promise<EmployeeRow> {
  const supabase = await createServerSupabaseClient()

  const { rate_centavos, compensation_type, ...employeeData } = data
  const { data: row, error } = await supabase
    .from('employees')
    .update({ ...employeeData, updated_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()
  if (error) throw error
  return row
}

export async function softDeleteEmployee(tenantId: string, id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('employees')
    .update({ deleted_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}
