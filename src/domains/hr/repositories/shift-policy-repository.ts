import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import type { ShiftPolicyDayInput } from '@/domains/hr/types'

type ShiftPolicyRow    = Database['public']['Tables']['shift_policies']['Row']
type ShiftPolicyDayRow = Database['public']['Tables']['shift_policy_days']['Row']

export interface ShiftPolicyWithDays extends ShiftPolicyRow {
  shift_policy_days: ShiftPolicyDayRow[]
}

export async function findAllShiftPolicies(tenantId: string): Promise<ShiftPolicyRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('shift_policies')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('name')
  if (error) throw error
  return data
}

export async function findShiftPolicyById(
  tenantId: string,
  id: string,
): Promise<ShiftPolicyWithDays | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('shift_policies')
    .select('*, shift_policy_days(*)')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (error) return null
  return data as ShiftPolicyWithDays
}

export async function insertShiftPolicy(
  tenantId: string,
  policy: Omit<Database['public']['Tables']['shift_policies']['Insert'], 'tenant_id'>,
  days: ShiftPolicyDayInput[],
): Promise<ShiftPolicyRow> {
  const supabase = await createServerSupabaseClient()

  const { data: policyRow, error: policyError } = await supabase
    .from('shift_policies')
    .insert({ tenant_id: tenantId, ...policy })
    .select()
    .single()
  if (policyError) throw policyError

  const dayRows = days.map((d) => ({ ...d, shift_policy_id: policyRow.id }))
  const { error: daysError } = await supabase.from('shift_policy_days').insert(dayRows)
  if (daysError) throw daysError

  return policyRow
}

export async function updateShiftPolicy(
  tenantId: string,
  id: string,
  policy: Partial<Database['public']['Tables']['shift_policies']['Update']>,
  days?: ShiftPolicyDayInput[],
): Promise<ShiftPolicyRow> {
  const supabase = await createServerSupabaseClient()

  const { data: policyRow, error: policyError } = await supabase
    .from('shift_policies')
    .update({ ...policy, updated_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()
  if (policyError) throw policyError

  if (days) {
    await supabase.from('shift_policy_days').delete().eq('shift_policy_id', id)
    const dayRows = days.map((d) => ({ ...d, shift_policy_id: id }))
    const { error: daysError } = await supabase.from('shift_policy_days').insert(dayRows)
    if (daysError) throw daysError
  }

  return policyRow
}

export async function softDeleteShiftPolicy(tenantId: string, id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('shift_policies')
    .update({ deleted_at: new Date().toISOString(), status: 'inactive' })
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}
