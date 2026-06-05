import Link from 'next/link'
import { requireTenant } from '@/platform/tenants'
import { getEmployees } from '@/domains/hr/services/employee-service'
import { getWorkLocations } from '@/domains/hr/services/work-location-service'
import { getJobTitles } from '@/domains/hr/services/job-title-service'
import { findCurrentRate } from '@/domains/hr/repositories/employee-rate-repository'
import { PageHeader } from '@/components/shared/page-header'
import { DataEmpty } from '@/components/shared/data-empty'
import { EmployeeCard } from '@/components/hr/employee-card'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faPlus } from '@fortawesome/free-solid-svg-icons'

export default async function HRPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; location?: string; offset?: string }>
}) {
  const params = await searchParams
  const { id: tenantId } = await requireTenant()

  const offset = parseInt(params.offset ?? '0', 10)
  const filters = {
    search:           params.q,
    status:           params.status as never,
    work_location_id: params.location,
    limit:            20,
    offset,
  }

  const [{ employees, total }, locations, jobTitles] = await Promise.all([
    getEmployees(tenantId, filters),
    getWorkLocations(tenantId),
    getJobTitles(tenantId),
  ])

  const locationMap = Object.fromEntries(locations.map((l) => [l.id, l.name]))
  const jobTitleMap = Object.fromEntries(jobTitles.map((j) => [j.id, j.name]))

  return (
    <section>
      <div className="flex items-start justify-between mb-8">
        <PageHeader
          label="Human Resources"
          title="Employees"
          description="Manage your workforce, track status, and maintain employee records."
          className="mb-0"
        />
        <Link href="/hr/new">
          <Button size="sm" className="gap-2">
            <FontAwesomeIcon icon={faPlus} className="fa-sm" />
            Add Employee
          </Button>
        </Link>
      </div>

      {employees.length === 0 && offset === 0 ? (
        <DataEmpty
          icon={faUsers}
          title="No employees yet"
          description="Add your first employee to get started with HR management."
          action={
            <Link href="/hr/new">
              <Button size="sm">Add Employee</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {total} employee{total !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <EmployeeCardWithRate
                key={employee.id}
                employee={employee}
                locationName={employee.work_location_id ? locationMap[employee.work_location_id] : null}
                jobTitleName={employee.job_title_id ? jobTitleMap[employee.job_title_id] : null}
              />
            ))}
          </div>

          {offset + employees.length < total && (
            <div className="mt-8 text-center">
              <Link href={`/hr?offset=${offset + 20}`}>
                <Button variant="outline">Load More</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </section>
  )
}

async function EmployeeCardWithRate({
  employee,
  locationName,
  jobTitleName,
}: {
  employee: { id: string; first_name: string; last_name: string; avatar_url: string | null; employee_number: string; status: string; compensation_type: string; work_location_id: string | null; job_title_id: string | null }
  locationName: string | null
  jobTitleName: string | null
}) {
  const currentRate = await findCurrentRate(employee.id)
  return (
    <EmployeeCard
      employee={employee as never}
      rateCentavos={currentRate?.rate_centavos}
      locationName={locationName}
      jobTitleName={jobTitleName}
    />
  )
}
