'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { logAudit } from '@/platform/audit'
import { EmployeeSchema, StatusChangeSchema } from '@/domains/hr/types'
import { toasts, createActionResult } from '@/lib/toast-server'
import {
  createEmployee,
  updateEmployeeDetails,
  changeEmployeeStatus,
  suggestEmployeeNumber,
} from '@/domains/hr/services/employee-service'
import { softDeleteEmployee } from '@/domains/hr/repositories/employee-repository'
import type { Enums } from '@/types/supabase'

export async function getNextEmployeeNumberAction(): Promise<string> {
  const { id: tenantId } = await requireTenant()
  return suggestEmployeeNumber(tenantId)
}

export async function createEmployeeAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const raw = {
    first_name:              formData.get('first_name'),
    middle_name:             formData.get('middle_name') || '',
    last_name:               formData.get('last_name'),
    suffix:                  formData.get('suffix') || '',
    employee_number:         formData.get('employee_number'),
    hire_date:               formData.get('hire_date'),
    employment_type:         formData.get('employment_type'),
    compensation_type:       formData.get('compensation_type'),
    rate_centavos:           Number(formData.get('rate_centavos')),
    work_location_id:        formData.get('work_location_id'),
    job_title_id:            formData.get('job_title_id') || null,
    date_of_birth:           formData.get('date_of_birth') || null,
    contact_number:          formData.get('contact_number') || '',
    email:                   formData.get('email') || '',
    address:                 formData.get('address') || '',
    emergency_contact_name:  formData.get('emergency_contact_name') || '',
    emergency_contact_phone: formData.get('emergency_contact_phone') || '',
    tin:                     formData.get('tin') || '',
    sss_number:              formData.get('sss_number') || '',
    philhealth_number:       formData.get('philhealth_number') || '',
    pagibig_number:          formData.get('pagibig_number') || '',
    sil_exempt:              formData.get('sil_exempt') === 'true',
    status:                   'probationary',
  }

  const parsed = EmployeeSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }
  }

  let employee: { id: string }
  try {
    employee = await createEmployee(tenantId, userId, parsed.data)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to create employee' }
  }

  redirect(`/hr/${employee.id}`)
}

export async function updateEmployeeAction(
  employeeId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const raw = {
    first_name:              formData.get('first_name'),
    middle_name:             formData.get('middle_name') || '',
    last_name:               formData.get('last_name'),
    suffix:                  formData.get('suffix') || '',
    employee_number:         formData.get('employee_number'),
    hire_date:               formData.get('hire_date'),
    employment_type:         formData.get('employment_type'),
    compensation_type:       formData.get('compensation_type'),
    rate_centavos:           Number(formData.get('rate_centavos')),
    work_location_id:        formData.get('work_location_id'),
    job_title_id:            formData.get('job_title_id') || null,
    date_of_birth:           formData.get('date_of_birth') || null,
    contact_number:          formData.get('contact_number') || '',
    email:                   formData.get('email') || '',
    address:                 formData.get('address') || '',
    emergency_contact_name:  formData.get('emergency_contact_name') || '',
    emergency_contact_phone: formData.get('emergency_contact_phone') || '',
    tin:                     formData.get('tin') || '',
    sss_number:              formData.get('sss_number') || '',
    philhealth_number:       formData.get('philhealth_number') || '',
    pagibig_number:          formData.get('pagibig_number') || '',
    sil_exempt:              formData.get('sil_exempt') === 'true',
  }

  const parsed = EmployeeSchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues?.[0]?.message ?? 'Invalid input' }

  try {
    await updateEmployeeDetails(tenantId, userId, employeeId, parsed.data)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update employee' }
  }

  revalidatePath(`/hr/${employeeId}`)
  return null
}

export async function changeEmployeeStatusAction(
  employeeId: string,
  _prev: unknown,
  formData: FormData,
) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const parsed = StatusChangeSchema.safeParse({
    status:         formData.get('status'),
    reason:         formData.get('reason') || undefined,
    effective_date: formData.get('effective_date'),
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
    await changeEmployeeStatus(tenantId, userId, employeeId, parsed.data)
    revalidatePath(`/hr/${employeeId}`)
    revalidatePath('/hr')
    return createActionResult(
      true,
      undefined,
      undefined,
      toasts.success('Employee status updated!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to change status'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Failed to update status', message)
    )
  }
}

export async function archiveEmployeeAction(
  employeeId: string,
) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner'])

  try {
    await softDeleteEmployee(tenantId, employeeId)
    await logAudit({
      tenantId,
      actor: userId,
      action: 'DELETE',
      entity: 'employees',
      entityId: employeeId,
      reason: 'Employee archived',
    })
    return createActionResult(
      true,
      undefined,
      undefined,
      toasts.success('Employee archived!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to archive employee'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Failed to archive', message)
    )
  }
}
