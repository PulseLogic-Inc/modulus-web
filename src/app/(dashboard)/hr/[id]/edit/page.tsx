import { notFound } from 'next/navigation'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { getEmployeeWithRate } from '@/domains/hr/services/employee-service'
import { getWorkLocations } from '@/domains/hr/services/work-location-service'
import { getJobTitles } from '@/domains/hr/services/job-title-service'
import { PageHeader } from '@/components/shared/page-header'
import { EditEmployeeForm } from './edit-employee-form'
import type { Enums } from '@/types/supabase'

export default async function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { id: tenantId, role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const [employee, locations, jobTitles] = await Promise.all([
    getEmployeeWithRate(tenantId, id),
    getWorkLocations(tenantId),
    getJobTitles(tenantId),
  ])

  if (!employee) notFound()

  return (
    <section>
      <div className="mb-8">
        <PageHeader
          label="HR / Employees"
          title="Edit Employee"
          description={`Updating ${employee.first_name} ${employee.last_name}`}
        />
      </div>

      <div className="max-w-2xl">
        <EditEmployeeForm
          employee={employee}
          locations={locations}
          jobTitles={jobTitles}
        />
      </div>
    </section>
  )
}
