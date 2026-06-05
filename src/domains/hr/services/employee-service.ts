import {
  findAllEmployees,
  findEmployeeById,
  findLastEmployeeNumber,
  insertEmployee,
  updateEmployee,
  countEmployees,
  type EmployeeFilters,
} from '@/domains/hr/repositories/employee-repository'
import {
  findCurrentRate,
  findRateHistory,
  insertRate,
  closeCurrentRate,
} from '@/domains/hr/repositories/employee-rate-repository'
import { findOrCreateJobTitle } from '@/domains/hr/services/job-title-service'
import { logAudit } from '@/platform/audit'
import type { EmployeeInput, EmployeeRateInput, StatusChangeInput } from '@/domains/hr/types'
import type { Database } from '@/types/supabase'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type EmployeeRow = Database['public']['Tables']['employees']['Row']
type RateRow     = Database['public']['Tables']['employee_rates']['Row']

export interface EmployeeWithRate extends EmployeeRow {
  current_rate: RateRow | null
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

export async function getEmployees(
  tenantId: string,
  filters?: EmployeeFilters,
): Promise<{ employees: EmployeeRow[]; total: number }> {
  const [employees, total] = await Promise.all([
    findAllEmployees(tenantId, filters),
    countEmployees(tenantId, filters),
  ])
  return { employees, total }
}

export async function getEmployeeWithRate(
  tenantId: string,
  id: string,
): Promise<EmployeeWithRate | null> {
  const employee = await findEmployeeById(tenantId, id)
  if (!employee) return null
  const currentRate = await findCurrentRate(id)
  return { ...employee, current_rate: currentRate }
}

export async function getEmployeeRateHistory(employeeId: string): Promise<RateRow[]> {
  return findRateHistory(employeeId)
}

// ---------------------------------------------------------------------------
// Generate next employee number: YYYY-NNN
// ---------------------------------------------------------------------------

async function generateEmployeeNumber(tenantId: string): Promise<string> {
  const year = new Date().getFullYear()
  const last = await findLastEmployeeNumber(tenantId, year)
  const next = String(last + 1).padStart(3, '0')
  return `${year}-${next}`
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export async function createEmployee(
  tenantId: string,
  actorId: string,
  input: EmployeeInput,
): Promise<EmployeeRow> {
  const { rate_centavos, compensation_type, job_title_id, ...employeeData } = input

  // Resolve job title (typeahead: find or create)
  let resolvedJobTitleId: string | null = job_title_id ?? null
  // job_title_id might come as a name string from typeahead — handled in server action

  // Generate employee number if not provided or auto-suggest was used
  const employeeNumber = employeeData.employee_number.trim()

  const employee = await insertEmployee(tenantId, {
    ...employeeData,
    employee_number: employeeNumber,
    job_title_id:    resolvedJobTitleId,
    compensation_type: compensation_type,
    status:          'probationary', // default per EMP-006
  })

  // Create initial rate row
  await insertRate({
    employee_id:      employee.id,
    tenant_id:        tenantId,
    compensation_type,
    rate_centavos,
    effective_from:   employee.hire_date,
  })

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'CREATE',
    entity:   'employees',
    entityId: employee.id,
    newValue: { ...employee, rate_centavos, compensation_type },
  })

  return employee
}

export async function updateEmployeeDetails(
  tenantId: string,
  actorId: string,
  id: string,
  input: Partial<EmployeeInput>,
): Promise<EmployeeRow> {
  const existing = await findEmployeeById(tenantId, id)
  if (!existing) throw new Error('Employee not found')

  const { rate_centavos, compensation_type, ...employeeData } = input

  // Handle rate/compensation type change (EMP-005):
  // Creates a new rate row effective today — never overwrites historical rates
  if (rate_centavos !== undefined || compensation_type !== undefined) {
    const today = new Date().toISOString().split('T')[0]
    await closeCurrentRate(id, today)
    await insertRate({
      employee_id:      id,
      tenant_id:        tenantId,
      compensation_type: compensation_type ?? existing.compensation_type,
      rate_centavos:    rate_centavos ?? (await findCurrentRate(id))?.rate_centavos ?? 0,
      effective_from:   today,
    })
  }

  const updated = await updateEmployee(tenantId, id, employeeData)

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'UPDATE',
    entity:   'employees',
    entityId: id,
    oldValue: existing,
    newValue: updated,
  })

  return updated
}

export async function changeEmployeeStatus(
  tenantId: string,
  actorId: string,
  employeeId: string,
  input: StatusChangeInput,
): Promise<EmployeeRow> {
  const existing = await findEmployeeById(tenantId, employeeId)
  if (!existing) throw new Error('Employee not found')

  // Write to status history (append-only)
  const supabase = await createServerSupabaseClient()
  await supabase.from('employee_status_history').insert({
    employee_id:    employeeId,
    tenant_id:      tenantId,
    status:         input.status,
    reason:         input.reason ?? null,
    effective_date: input.effective_date,
    actor:          actorId,
  })

  // Update current status on employee record
  const updated = await updateEmployee(tenantId, employeeId, { status: input.status })

  await logAudit({
    tenantId,
    actor:    actorId,
    action:   'STATUS_CHANGE',
    entity:   'employees',
    entityId: employeeId,
    oldValue: { status: existing.status },
    newValue: { status: input.status, reason: input.reason, effective_date: input.effective_date },
  })

  return updated
}

export async function suggestEmployeeNumber(tenantId: string): Promise<string> {
  return generateEmployeeNumber(tenantId)
}
