import { createServerSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'
import type { WorkLocationInput } from '@/domains/hr/types'

type WorkLocationRow = Database['public']['Tables']['work_locations']['Row']

export async function findAllWorkLocations(tenantId: string): Promise<WorkLocationRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('work_locations')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('name')
  if (error) throw error
  return data
}

export async function findWorkLocationById(tenantId: string, id: string): Promise<WorkLocationRow | null> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('work_locations')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (error) return null
  return data
}

export async function insertWorkLocation(
  tenantId: string,
  data: WorkLocationInput,
): Promise<WorkLocationRow> {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('work_locations')
    .insert({ tenant_id: tenantId, ...data })
    .select()
    .single()
  if (error) throw error
  return row
}

export async function updateWorkLocation(
  tenantId: string,
  id: string,
  data: Partial<WorkLocationInput>,
): Promise<WorkLocationRow> {
  const supabase = await createServerSupabaseClient()
  const { data: row, error } = await supabase
    .from('work_locations')
    .update({ ...data, updated_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .is('deleted_at', null)
    .select()
    .single()
  if (error) throw error
  return row
}

export async function softDeleteWorkLocation(tenantId: string, id: string): Promise<void> {
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase
    .from('work_locations')
    .update({ deleted_at: new Date().toISOString(), status: 'inactive' })
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}
