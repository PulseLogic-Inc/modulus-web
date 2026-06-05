import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import type { HolidayInput } from '@/domains/hr/types'

type HolidayRow = Database['public']['Tables']['company_holidays']['Row']

export async function findHolidaysByYear(tenantId: string, year: number): Promise<HolidayRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('company_holidays')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .gte('date', `${year}-01-01`)
    .lte('date', `${year}-12-31`)
    .order('date')
  if (error) throw error
  return data
}

export async function findHolidayByDate(tenantId: string, date: string): Promise<HolidayRow | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('company_holidays')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('date', date)
    .is('deleted_at', null)
    .single()
  return data
}

export async function insertHoliday(tenantId: string, data: HolidayInput): Promise<HolidayRow> {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('company_holidays')
    .insert({ tenant_id: tenantId, ...data })
    .select()
    .single()
  if (error) throw error
  return row
}

export async function updateHoliday(
  tenantId: string,
  id: string,
  data: Partial<HolidayInput>,
): Promise<HolidayRow> {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('company_holidays')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()
  if (error) throw error
  return row
}

export async function softDeleteHoliday(tenantId: string, id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('company_holidays')
    .update({ deleted_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}
