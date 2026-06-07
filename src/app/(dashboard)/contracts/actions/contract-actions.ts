'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import {
  GenerateContractSchema,
  IssueContractSchema,
  VoidContractSchema,
} from '@/domains/contracts/types'
import { toasts, createActionResult } from '@/lib/toast-server'
import {
  generateContract,
  issueContract,
  voidContract,
} from '@/domains/contracts/services/contract-service'
import type { Enums } from '@/types/supabase'

export async function generateContractAction(
  _prev: unknown,
  formData: FormData,
) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const raw = {
    employee_id: formData.get('employee_id'),
    contract_type: formData.get('contract_type'),
  }

  const parsed = GenerateContractSchema.safeParse(raw)
  if (!parsed.success) {
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    const contract = await generateContract(
      tenantId,
      userId,
      parsed.data.employee_id,
      parsed.data.contract_type,
    )
    return createActionResult(
      true,
      { contractId: contract.id },
      undefined,
      toasts.success('Contract generated!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate contract'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Generation failed', message)
    )
  }
}

export async function issueContractAction(
  _prev: unknown,
  formData: FormData,
) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const raw = {
    contract_id: formData.get('contract_id'),
  }

  const parsed = IssueContractSchema.safeParse(raw)
  if (!parsed.success) {
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    await issueContract(tenantId, userId, parsed.data.contract_id)
    revalidatePath(`/contracts/${parsed.data.contract_id}`)
    revalidatePath('/employees')
    return createActionResult(
      true,
      undefined,
      undefined,
      toasts.success('Contract issued successfully!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to issue contract'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Issue failed', message)
    )
  }
}

export async function voidContractAction(
  contractId: string,
  _prev: unknown,
  formData: FormData,
) {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const raw = {
    contract_id: contractId,
    reason: formData.get('reason'),
  }

  const parsed = VoidContractSchema.safeParse(raw)
  if (!parsed.success) {
    return createActionResult(
      false,
      undefined,
      parsed.error.issues?.[0]?.message ?? 'Invalid input',
      toasts.error('Validation failed', parsed.error.issues?.[0]?.message)
    )
  }

  try {
    await voidContract(tenantId, userId, parsed.data.contract_id, parsed.data.reason)
    revalidatePath(`/contracts/${contractId}`)
    return createActionResult(
      true,
      undefined,
      undefined,
      toasts.success('Contract voided!')
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to void contract'
    return createActionResult(
      false,
      undefined,
      message,
      toasts.error('Void failed', message)
    )
  }
}
