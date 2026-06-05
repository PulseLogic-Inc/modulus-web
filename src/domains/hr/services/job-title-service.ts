import {
  findAllJobTitles,
  findJobTitleByName,
  insertJobTitle,
  updateJobTitle,
  softDeleteJobTitle,
} from '@/domains/hr/repositories/job-title-repository'
import type { Database } from '@/types/supabase'

type JobTitleRow = Database['public']['Tables']['job_titles']['Row']

export async function getJobTitles(tenantId: string): Promise<JobTitleRow[]> {
  return findAllJobTitles(tenantId)
}

/**
 * Typeahead behavior: returns existing job title or creates a new one.
 * Soft-uniqueness: case-insensitive match prevents near-duplicates.
 */
export async function findOrCreateJobTitle(
  tenantId: string,
  name: string,
): Promise<JobTitleRow> {
  const trimmed  = name.trim()
  const existing = await findJobTitleByName(tenantId, trimmed)
  if (existing) return existing
  return insertJobTitle(tenantId, trimmed)
}

export async function createJobTitle(tenantId: string, name: string): Promise<JobTitleRow> {
  return insertJobTitle(tenantId, name)
}

export async function updateJobTitleName(tenantId: string, id: string, name: string): Promise<JobTitleRow> {
  return updateJobTitle(tenantId, id, name)
}

export async function deleteJobTitle(tenantId: string, id: string): Promise<void> {
  return softDeleteJobTitle(tenantId, id)
}
