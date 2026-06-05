import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { getWorkLocations } from '@/domains/hr/services/work-location-service'
import { suggestEmployeeNumber } from '@/domains/hr/services/employee-service'
import { PageHeader } from '@/components/shared/page-header'
import { AddEmployeeForm } from './add-employee-form'
import type { Enums } from '@/types/supabase'

export default async function NewEmployeePage() {
  const { id: tenantId, role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const [locations, suggestedNumber] = await Promise.all([
    getWorkLocations(tenantId),
    suggestEmployeeNumber(tenantId),
  ])

  return (
    <section className="max-w-2xl">
      <PageHeader
        label="Human Resources"
        title="Add Employee"
        description="Create a new employee record."
      />
      <AddEmployeeForm locations={locations} suggestedNumber={suggestedNumber} />
    </section>
  )
}
