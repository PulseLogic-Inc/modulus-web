'use server'

import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { JobTitleSchema } from '@/domains/hr/types'
import { toasts, createActionResult } from '@/lib/toast-server'
import {
  createJobTitle,
  updateJobTitleName,
  deleteJobTitle,
} from '@/domains/hr/services/job-title-service'
import type { Enums } from '@/types/supabase'

export async function createJobTitleAction(
  _prev: unknown,
  formData: FormData,
) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = JobTitleSchema.safeParse({
    name: formData.get('name'),
  })

  if (!parsed.success) {
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    const jobTitle = await createJobTitle(tenantId, parsed.data.name)
    revalidatePath('/hr/settings/job-titles')
    return createActionResult(
      true,
      { id: jobTitle.id },
      undefined,
      toasts.success('Job title created!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create job title'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Failed to create', message)
    )
  }
}

export async function updateJobTitleAction(
  jobTitleId: string,
  _prev: unknown,
  formData: FormData,
) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = JobTitleSchema.safeParse({
    name: formData.get('name'),
  })

  if (!parsed.success) {
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    await updateJobTitleName(tenantId, jobTitleId, parsed.data.name)
    revalidatePath('/hr/settings/job-titles')
    return createActionResult(
      true,
      { id: jobTitleId },
      undefined,
      toasts.success('Job title updated!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update job title'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Failed to update', message)
    )
  }
}

export async function deleteJobTitleAction(jobTitleId: string) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  try {
    await deleteJobTitle(tenantId, jobTitleId)
    revalidatePath('/hr/settings/job-titles')
    return createActionResult(
      true,
      undefined,
      undefined,
      toasts.success('Job title deleted!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to delete job title'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Failed to delete', message)
    )
  }
}
