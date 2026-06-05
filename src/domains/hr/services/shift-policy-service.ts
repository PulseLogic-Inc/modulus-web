import {
  findAllShiftPolicies,
  findShiftPolicyById,
  insertShiftPolicy,
  updateShiftPolicy,
  softDeleteShiftPolicy,
  type ShiftPolicyWithDays,
} from '@/domains/hr/repositories/shift-policy-repository'
import { logAudit } from '@/platform/audit'
import type { ShiftPolicyInput } from '@/domains/hr/types'
import type { Database } from '@/types/supabase'

type ShiftPolicyRow = Database['public']['Tables']['shift_policies']['Row']

export async function getShiftPolicies(tenantId: string): Promise<ShiftPolicyRow[]> {
  return findAllShiftPolicies(tenantId)
}

export async function getShiftPolicy(
  tenantId: string,
  id: string,
): Promise<ShiftPolicyWithDays | null> {
  return findShiftPolicyById(tenantId, id)
}

export async function createShiftPolicy(
  tenantId: string,
  actorId: string,
  input: ShiftPolicyInput,
): Promise<ShiftPolicyRow> {
  const { days, ...policyData } = input

  // Business rule: at least one non-rest day must have valid shift hours
  const hasWorkDay = days.some((d) => !d.is_rest_day)
  if (!hasWorkDay) throw new Error('Shift policy must have at least one working day')

  const policy = await insertShiftPolicy(tenantId, policyData, days)

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'CREATE',
    entity:   'shift_policies',
    entityId: policy.id,
    newValue: policy,
  })

  return policy
}

export async function updateShiftPolicyDetails(
  tenantId: string,
  actorId: string,
  id: string,
  input: Partial<ShiftPolicyInput>,
): Promise<ShiftPolicyRow> {
  const existing = await findShiftPolicyById(tenantId, id)
  if (!existing) throw new Error('Shift policy not found')

  const { days, ...policyData } = input
  const updated = await updateShiftPolicy(tenantId, id, policyData, days)

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'UPDATE',
    entity:   'shift_policies',
    entityId: id,
    oldValue: existing,
    newValue: updated,
  })

  return updated
}

export async function deactivateShiftPolicy(
  tenantId: string,
  actorId: string,
  id: string,
): Promise<void> {
  await softDeleteShiftPolicy(tenantId, id)
  await logAudit({ tenantId, actor: actorId, action: 'DEACTIVATE', entity: 'shift_policies', entityId: id })
}
