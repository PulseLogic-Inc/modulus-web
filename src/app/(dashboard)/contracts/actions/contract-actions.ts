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
import {
  generateContract,
  issueContract,
  voidContract,
} from '@/domains/contracts/services/contract-service'
import type { Enums } from '@/types/supabase'

/**
 * Generate contract action
 * Creates a contract in 'draft' status (no PDF yet)
 * Renders template with employee data
 * Requires Owner or HR Admin role
 */
export async function generateContractAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const raw = {
    employee_id: formData.get('employee_id'),
    contract_type: formData.get('contract_type'),
  }

  const parsed = GenerateContractSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message ?? 'Invalid input'
    return { error: firstError }
  }

  let contract
  try {
    contract = await generateContract(
      tenantId,
      userId,
      parsed.data.employee_id,
      parsed.data.contract_type,
    )
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to generate contract' }
  }

  // Redirect to contract review page
  redirect(`/contracts/${contract.id}`)
}

/**
 * Issue contract action
 * Marks contract as 'issued', generates PDF, uploads to Storage
 * Supersedes previous active contract if exists
 * Requires Owner or HR Admin role
 */
export async function issueContractAction(
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const raw = {
    contract_id: formData.get('contract_id'),
  }

  const parsed = IssueContractSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message ?? 'Invalid input'
    return { error: firstError }
  }

  try {
    await issueContract(tenantId, userId, parsed.data.contract_id)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to issue contract' }
  }

  revalidatePath(`/contracts/${parsed.data.contract_id}`)
  revalidatePath('/employees')
  return null
}

/**
 * Void contract action
 * Marks contract as 'voided' (terminal state)
 * Requires reason (minimum 10 characters)
 * Requires Owner or HR Admin role
 */
export async function voidContractAction(
  contractId: string,
  _prev: { error?: string } | null,
  formData: FormData,
): Promise<{ error?: string } | null> {
  const { id: tenantId, role, userId } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const raw = {
    contract_id: contractId,
    reason: formData.get('reason'),
  }

  const parsed = VoidContractSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues?.[0]?.message ?? 'Invalid input'
    return { error: firstError }
  }

  try {
    await voidContract(tenantId, userId, parsed.data.contract_id, parsed.data.reason)
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to void contract' }
  }

  revalidatePath(`/contracts/${contractId}`)
  return null
}
