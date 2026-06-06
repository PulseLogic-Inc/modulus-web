import { logAudit } from '@/platform/audit'
import { generatePdfFromTemplate, generateStoragePath } from '@/lib/pdf/generate'
import { getContractTemplate, type ContractData } from '@/lib/contracts/ph-template'
import {
  findContractsByEmployee,
  findActiveContract,
  findContractById,
  insertContract,
  updateContractStatus,
  softDeleteContract,
  supersedContract,
} from '@/domains/contracts/repositories/contract-repository'
import { findEmployeeById } from '@/domains/hr/repositories/employee-repository'
import { createAdminSupabaseClient } from '@/lib/supabase/admin'
import type { Database, Tables } from '@/types/supabase'
import type { ContractType, ContractStatus } from '@/domains/contracts/types'

type EmploymentContract = Database['public']['Tables']['employment_contracts']['Row']
type Employee = Database['public']['Tables']['employees']['Row']

/**
 * Generate a contract from employee data
 *
 * Process:
 * 1. Fetch employee data (name, position, hire date, rate, location, etc.)
 * 2. Fetch company data from tenant config
 * 3. Render contract template with data
 * 4. Generate PDF from rendered HTML
 * 5. Insert contract record (status = 'draft', no storage_path yet)
 *
 * @param tenantId - Tenant ID
 * @param userId - Actor (admin generating contract)
 * @param employeeId - Employee ID
 * @param contractType - Type of contract to generate
 * @returns Generated EmploymentContract (status: 'draft')
 */
export async function generateContract(
  tenantId: string,
  userId: string,
  employeeId: string,
  contractType: ContractType,
): Promise<EmploymentContract> {
  // 1. Fetch employee data
  const employee = await findEmployeeById(tenantId, employeeId)
  if (!employee) throw new Error('Employee not found')

  // 2. Fetch tenant config (company data) — TODO: implement fetchTenantConfig
  // For now, use placeholder values. In production, fetch from tenants table.
  const companyData = {
    company_name: 'Modulus Business Suite Inc.',
    company_address: 'Manila, Philippines',
    company_representative: 'CEO Name',
    company_representative_title: 'Chief Executive Officer',
  }

  // 3. Build contract data from employee + company
  const contractData = buildContractData(employee, companyData, contractType)

  // 4. Get template and interpolate
  const template = getContractTemplate(contractType)

  // 5. Interpolate template with data
  let interpolated = template
  for (const [key, value] of Object.entries(contractData)) {
    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
    interpolated = interpolated.replace(placeholder, String(value || ''))
  }

  // 6. Generate PDF (will throw if PDF library not implemented)
  let pdfBuffer: Buffer | null = null
  try {
    pdfBuffer = await generatePdfFromTemplate(template, contractData as unknown as Record<string, string | number>, `contract-${employeeId}`)
  } catch (err) {
    // PDF generation not yet implemented — continue without PDF
    console.warn('PDF generation not implemented, creating contract without PDF:', err)
  }

  // 7. Insert contract record (status = 'draft', no storage_path yet)
  const contract = await insertContract({
    tenant_id: tenantId,
    employee_id: employeeId,
    contract_type: contractType,
    status: 'draft',
    effective_from: new Date().toISOString().split('T')[0],
    effective_to: null,
    issued_at: null,
    issued_by: null,
    voided_at: null,
    voided_by: null,
    void_reason: null,
    storage_path: null,
  })

  // 8. Log audit
  await logAudit({
    tenantId,
    actor: userId,
    action: 'CREATE',
    entity: 'employment_contracts',
    entityId: contract.id,
    newValue: contract,
    reason: `Generated ${contractType} contract for ${employee.first_name} ${employee.last_name}`,
  })

  return contract
}

/**
 * Issue a contract (mark as issued, upload PDF to Storage)
 *
 * Process:
 * 1. Fetch contract (must be in draft status)
 * 2. Check if previous active contract exists (mark as superseded)
 * 3. Re-generate PDF with current data
 * 4. Upload PDF to Supabase Storage
 * 5. Update contract status to 'issued' with storage_path
 *
 * @param tenantId - Tenant ID
 * @param userId - Actor (admin issuing contract)
 * @param contractId - Contract ID (must be in draft)
 * @returns Updated EmploymentContract (status: 'issued')
 */
export async function issueContract(
  tenantId: string,
  userId: string,
  contractId: string,
): Promise<EmploymentContract> {
  // 1. Fetch contract (must be draft)
  const contract = await findContractById(tenantId, contractId)
  if (!contract) throw new Error('Contract not found')
  if (contract.status !== 'draft') throw new Error(`Cannot issue contract with status: ${contract.status}`)

  // 2. Fetch employee (to build fresh contract data)
  const employee = await findEmployeeById(tenantId, contract.employee_id)
  if (!employee) throw new Error('Employee not found')

  // 3. Check for previous active contract (supersede it)
  const activeContract = await findActiveContract(tenantId, contract.employee_id)
  if (activeContract && activeContract.id !== contractId) {
    await supersedContract(tenantId, activeContract.id)
  }

  // 4. Re-generate PDF
  const companyData = {
    company_name: 'Modulus Business Suite Inc.',
    company_address: 'Manila, Philippines',
    company_representative: 'CEO Name',
    company_representative_title: 'Chief Executive Officer',
  }
  const contractData = buildContractData(employee, companyData, contract.contract_type as ContractType)
  const template = getContractTemplate(contract.contract_type as ContractType)

  let pdfBuffer: Buffer | null = null
  let storagePath: string | null = null

  try {
    pdfBuffer = await generatePdfFromTemplate(template, contractData as unknown as Record<string, string | number>, `contract-${contract.employee_id}`)

    // 5. Upload to Supabase Storage
    const adminClient = await createAdminSupabaseClient()
    storagePath = generateStoragePath(
      'contracts',
      tenantId,
      contract.id,
      `${contract.contract_type}-contract-${contract.employee_id}`,
    )

    const { error: uploadError } = await adminClient.storage
      .from('employee-documents')
      .upload(storagePath, pdfBuffer, {
        cacheControl: '3600',
        upsert: true,
      })

    if (uploadError) throw uploadError
  } catch (err) {
    console.warn('PDF upload failed, issuing contract without storage_path:', err)
    storagePath = null
  }

  // 6. Update contract status to 'issued'
  const updated = await updateContractStatus(tenantId, contractId, 'issued', {
    issued_at: new Date().toISOString(),
    issued_by: userId,
    storage_path: storagePath ?? undefined,
  })

  // 7. Log audit
  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'employment_contracts',
    entityId: contractId,
    oldValue: contract,
    newValue: updated,
    reason: `Issued ${contract.contract_type} contract; storage path: ${storagePath}`,
  })

  return updated
}

/**
 * Void a contract (terminal state, requires reason)
 * @param tenantId - Tenant ID
 * @param userId - Actor
 * @param contractId - Contract ID
 * @param reason - Reason for voiding
 * @returns Updated EmploymentContract (status: 'voided')
 */
export async function voidContract(
  tenantId: string,
  userId: string,
  contractId: string,
  reason: string,
): Promise<EmploymentContract> {
  const contract = await findContractById(tenantId, contractId)
  if (!contract) throw new Error('Contract not found')

  const updated = await updateContractStatus(tenantId, contractId, 'voided', {
    voided_at: new Date().toISOString(),
    voided_by: userId,
    void_reason: reason,
  })

  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'employment_contracts',
    entityId: contractId,
    oldValue: contract,
    newValue: updated,
    reason: `Voided contract: ${reason}`,
  })

  return updated
}

/**
 * Get all contracts for an employee (active + history)
 * @param tenantId - Tenant ID
 * @param employeeId - Employee ID
 * @returns Array of contracts
 */
export async function getEmployeeContracts(
  tenantId: string,
  employeeId: string,
): Promise<EmploymentContract[]> {
  return findContractsByEmployee(tenantId, employeeId)
}

/**
 * Get the current/active contract for an employee
 * @param tenantId - Tenant ID
 * @param employeeId - Employee ID
 * @returns EmploymentContract or null
 */
export async function getActiveContract(
  tenantId: string,
  employeeId: string,
): Promise<EmploymentContract | null> {
  return findActiveContract(tenantId, employeeId)
}

/**
 * Build contract data object for template interpolation
 * Maps employee + company data to contract template placeholders
 */
function buildContractData(
  employee: Employee,
  companyData: Record<string, string>,
  contractType: ContractType,
): ContractData {
  const now = new Date()
  // TODO: Fetch actual rate from salary history table
  const rateCentavos = 0 // Placeholder - fetch from actual employee data
  const formattedDailyRate = (rateCentavos / 100).toFixed(2)
  const monthlyRate = ((rateCentavos * 22) / 100).toFixed(2) // 22 working days

  return {
    // Company info
    company_name: companyData.company_name,
    company_address: companyData.company_address,
    company_representative: companyData.company_representative,
    company_representative_title: companyData.company_representative_title,

    // Employee info
    employee_name: `${employee.first_name} ${employee.middle_name || ''} ${employee.last_name}`.trim(),
    employee_age: calculateAge(new Date(employee.date_of_birth || '')).toString(),
    employee_citizenship: 'Filipino',
    employee_address: employee.address || '',

    // Employment details
    job_title: 'Position Title', // TODO: fetch from job_titles table
    work_location: 'Work Location', // TODO: fetch from work_locations table
    date_signed: formatDatePh(now),
    shift_start: '08:00',
    shift_end: '17:00',
    work_hours: '8',
    work_days_per_week: '5',
    rest_day: 'Sunday',
    break_minutes: '60',

    // Compensation
    compensation_type: employee.compensation_type === 'daily' ? 'Daily' : 'Monthly',
    formatted_daily_rate: formattedDailyRate,
    formatted_rate: employee.compensation_type === 'daily' ? formattedDailyRate : monthlyRate,
    monthly_salary: monthlyRate,
    daily_rate: formattedDailyRate,

    // Leave
    vacation_days: '5',
    sick_days: '5',

    // Duration
    notice_days: '30',
    contract_duration: '6 months',
    project_name: 'Project Name',
    project_start_date: formatDatePh(now),
    project_end_date: formatDatePh(new Date(now.getFullYear(), now.getMonth() + 6)),
    contract_start_date: formatDatePh(new Date(employee.hire_date)),
    contract_end_date: formatDatePh(new Date(now.getFullYear() + 1, now.getMonth())),
    payment_schedule: 'Monthly',
    payment_method: 'Bank Transfer',
    payment_frequency: 'Monthly',
    payment_terms: 'Upon completion of milestones',
  }
}

/**
 * Helper: Calculate age from birthdate
 */
function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/**
 * Helper: Format date for Philippine contracts (Month Day, Year)
 */
function formatDatePh(date: Date): string {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}
