'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { logAudit } from '@/platform/audit'
import {
  createJobTitle,
  updateJobTitleName,
  deleteJobTitle,
} from '@/domains/hr/services/job-title-service'
import type { Enums } from '@/types/supabase'

export async function createJobTitleAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const name = (formData.get('name') ?? '').toString().trim()

  if (!name) return { error: 'Job title name is required' }
  if (name.length > 100) return { error: 'Job title name must be 100 characters or less' }

  try {
    const jobTitle = await createJobTitle(tenantId, name)
    await logAudit({
      tenantId,
      actor: userId,
      action: 'CREATE',
      entity: 'job_titles',
      entityId: jobTitle.id,
      newValue: { name: jobTitle.name },
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create job title' }
  }

  revalidatePath('/hr/settings/job-titles')
  return null
}

export async function updateJobTitleAction(
  jobTitleId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const name = (formData.get('name') ?? '').toString().trim()

  if (!name) return { error: 'Job title name is required' }
  if (name.length > 100) return { error: 'Job title name must be 100 characters or less' }

  try {
    const jobTitle = await updateJobTitleName(tenantId, jobTitleId, name)
    await logAudit({
      tenantId,
      actor: userId,
      action: 'UPDATE',
      entity: 'job_titles',
      entityId: jobTitle.id,
      newValue: { name: jobTitle.name },
    })
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update job title' }
  }

  revalidatePath('/hr/settings/job-titles')
  return null
}

export async function deleteJobTitleAction(jobTitleId: string): Promise<void> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  try {
    await deleteJobTitle(tenantId, jobTitleId)
    await logAudit({
      tenantId,
      actor: userId,
      action: 'DELETE',
      entity: 'job_titles',
      entityId: jobTitleId,
    })
  } catch (err) {
    throw err instanceof Error ? err : new Error('Failed to delete job title')
  }

  revalidatePath('/hr/settings/job-titles')
}
