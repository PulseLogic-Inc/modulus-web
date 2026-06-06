import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

type JobTitleRow = Database['public']['Tables']['job_titles']['Row']

export async function findAllJobTitles(tenantId: string): Promise<JobTitleRow[]> {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase
    .from('job_titles')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .order('name')
  if (error) throw error
  return data
}

export async function findJobTitleByName(tenantId: string, name: string): Promise<JobTitleRow | null> {
  const supabase = await createServerSupabaseClient()
  const { data } = await supabase
    .from('job_titles')
    .select('*')
    .eq('tenant_id', tenantId)
    .ilike('name', name.trim()) // case-insensitive match
    .is('deleted_at', null)
    .single()
  return data
}

export async function insertJobTitle(tenantId: string, name: string): Promise<JobTitleRow> {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('job_titles')
    .insert({ tenant_id: tenantId, name: name.trim() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateJobTitle(tenantId: string, id: string, name: string): Promise<JobTitleRow> {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from('job_titles')
    .update({ name: name.trim() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function softDeleteJobTitle(tenantId: string, id: string): Promise<void> {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from('job_titles')
    .update({ deleted_at: new Date().toISOString() })
    .eq('tenant_id', tenantId)
    .eq('id', id)
  if (error) throw error
}
