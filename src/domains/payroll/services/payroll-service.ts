import { logAudit } from '@/platform/audit'
import {
  findPayrollRunById,
  findPayrollRunsByPeriod,
  updatePayrollRunStatus,
  createPayrollRun,
  findPayrollPeriodById,
} from '@/domains/payroll/repositories/payroll-repository'
import type { Database } from '@/types/supabase'

type PayrollRun = Database['public']['Tables']['payroll_runs']['Row']

/**
 * Generate payroll for a period (skeleton)
 *
 * NOTE: Full integration with employee rates, worked hours, leave balance,
 * and statutory tables required. This is a structural skeleton for Sprint 6.
 */
export async function generatePayroll(
  tenantId: string,
  payrollPeriodId: string,
  userId: string,
) {
  const existing = await findPayrollRunsByPeriod(tenantId, payrollPeriodId)
  if (existing && existing.status !== 'draft') {
    throw new Error(`Payroll already exists for this period (status: ${existing.status})`)
  }

  let payrollRun = existing || (await createPayrollRun(tenantId, payrollPeriodId))

  await updatePayrollRunStatus(tenantId, payrollRun.id, 'processing')

  try {
    const period = await findPayrollPeriodById(tenantId, payrollPeriodId)
    if (!period) throw new Error('Payroll period not found')

    const generated = await updatePayrollRunStatus(tenantId, payrollRun.id, 'generated', {
      status: 'generated',
      employee_count: 0,
      total_gross_centavos: 0,
      total_net_centavos: 0,
      total_employer_centavos: 0,
      generated_at: new Date().toISOString(),
      generated_by: userId,
    })

    await logAudit({
      tenantId,
      actor: userId,
      action: 'CREATE',
      entity: 'payroll_runs',
      entityId: payrollRun.id,
      newValue: generated,
      reason: `Payroll generated for period ${period.period_code}`,
    })

    return generated
  } catch (error) {
    await updatePayrollRunStatus(tenantId, payrollRun.id, 'draft')
    throw error
  }
}

/**
 * Finalize payroll (OWNER ONLY)
 */
export async function finalizePayroll(
  tenantId: string,
  payrollRunId: string,
  userId: string,
) {
  const payrollRun = await findPayrollRunById(tenantId, payrollRunId)
  if (!payrollRun) throw new Error('Payroll run not found')

  if (payrollRun.status !== 'generated') {
    throw new Error(`Can only finalize GENERATED payroll (current: ${payrollRun.status})`)
  }

  const finalized = await updatePayrollRunStatus(tenantId, payrollRunId, 'finalized', {
    status: 'finalized',
    finalized_at: new Date().toISOString(),
    finalized_by: userId,
  })

  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'payroll_runs',
    entityId: payrollRunId,
    oldValue: payrollRun,
    newValue: finalized,
    reason: 'Payroll finalized by Owner',
  })

  return finalized
}

/**
 * Reopen payroll (OWNER ONLY, max 3 reopens)
 */
export async function reopenPayroll(
  tenantId: string,
  payrollRunId: string,
  reason: string,
  userId: string,
) {
  const payrollRun = await findPayrollRunById(tenantId, payrollRunId)
  if (!payrollRun) throw new Error('Payroll run not found')

  if (payrollRun.status !== 'finalized') {
    throw new Error(`Can only reopen FINALIZED payroll (current: ${payrollRun.status})`)
  }

  if ((payrollRun.reopen_count || 0) >= 3) {
    throw new Error('Maximum reopen limit (3) reached')
  }

  if (reason.length < 50) {
    throw new Error('Reopen reason must be at least 50 characters')
  }

  const reopened = await updatePayrollRunStatus(tenantId, payrollRunId, 'draft', {
    status: 'draft',
    reopen_count: (payrollRun.reopen_count || 0) + 1,
  })

  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'payroll_runs',
    entityId: payrollRunId,
    oldValue: payrollRun,
    newValue: reopened,
    reason: `Payroll reopened (reopen #${(payrollRun.reopen_count || 0) + 1}): ${reason}`,
  })

  return reopened
}

/**
 * Void payroll (OWNER ONLY, terminal state)
 */
export async function voidPayroll(
  tenantId: string,
  payrollRunId: string,
  voidReason: string,
  userId: string,
) {
  const payrollRun = await findPayrollRunById(tenantId, payrollRunId)
  if (!payrollRun) throw new Error('Payroll run not found')

  if (payrollRun.status === 'voided') {
    throw new Error('Payroll is already voided')
  }

  if (voidReason.length < 50) {
    throw new Error('Void reason must be at least 50 characters')
  }

  const voided = await updatePayrollRunStatus(tenantId, payrollRunId, 'voided', {
    status: 'voided',
    voided_at: new Date().toISOString(),
    voided_by: userId,
    void_reason: voidReason,
  })

  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'payroll_runs',
    entityId: payrollRunId,
    oldValue: payrollRun,
    newValue: voided,
    reason: `Payroll voided (TERMINAL): ${voidReason}`,
  })

  return voided
}

/**
 * Get payroll run summary
 */
export async function getPayrollRunSummary(tenantId: string, payrollRunId: string) {
  return findPayrollRunById(tenantId, payrollRunId)
}
