import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type RateRow    = Database['public']['Tables']['employee_rates']['Row']
type RateInsert = Database['public']['Tables']['employee_rates']['Insert']

export async function findCurrentRate(employeeId: string): Promise<RateRow | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('employee_rates')
    .select('*')
    .eq('employee_id', employeeId)
    .is('effective_to', null)
    .order('effective_from', { ascending: false })
    .limit(1)
    .single()
  return data
}

export async function findRateHistory(employeeId: string): Promise<RateRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('employee_rates')
    .select('*')
    .eq('employee_id', employeeId)
    .order('effective_from', { ascending: false })
  if (error) throw error
  return data
}

export async function insertRate(data: RateInsert): Promise<RateRow> {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('employee_rates')
    .insert(data)
    .select()
    .single()
  if (error) throw error
  return row
}

export async function closeCurrentRate(employeeId: string, effectiveTo: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('employee_rates')
    .update({ effective_to: effectiveTo })
    .eq('employee_id', employeeId)
    .is('effective_to', null)
  if (error) throw error
}
