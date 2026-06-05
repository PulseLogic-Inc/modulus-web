import { notFound } from 'next/navigation'
import { requireTenant } from '@/platform/tenants'
import { getEmployeeWithRate, getEmployeeRateHistory } from '@/domains/hr/services/employee-service'
import { getWorkLocations } from '@/domains/hr/services/work-location-service'
import { getJobTitles } from '@/domains/hr/services/job-title-service'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { EmployeeAvatar } from '@/components/hr/employee-avatar'
import { StatusBadge } from '@/components/hr/status-badge'
import { formatCentavos } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation, faBuilding, faBriefcase, faCalendar } from '@fortawesome/free-solid-svg-icons'
import type { EmployeeStatus } from '@/domains/hr/types'

export default async function EmployeeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { id: tenantId } = await requireTenant()

  const [employee, locations, jobTitles, supabase] = await Promise.all([
    getEmployeeWithRate(tenantId, id),
    getWorkLocations(tenantId),
    getJobTitles(tenantId),
    createServerSupabaseClient(),
  ])

  if (!employee) notFound()

  const locationName = employee.work_location_id
    ? locations.find((l) => l.id === employee.work_location_id)?.name
    : null
  const jobTitleName = employee.job_title_id
    ? jobTitles.find((j) => j.id === employee.job_title_id)?.name
    : null

  const rateHistory = await getEmployeeRateHistory(employee.id)

  const { data: statusHistory } = await supabase
    .from('employee_status_history')
    .select('*')
    .eq('employee_id', employee.id)
    .order('effective_date', { ascending: false })

  // 6-month probation flag
  const hireDate    = new Date(employee.hire_date)
  const sixMonths   = new Date(hireDate)
  sixMonths.setMonth(sixMonths.getMonth() + 6)
  const isProbationWarning =
    employee.status === 'probationary' && new Date() < sixMonths

  return (
    <section>
      {/* Probation banner */}
      {isProbationWarning && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-900/20 p-4 flex items-center gap-3">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-amber-600 fa-lg flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            Probationary employee. Regularization deadline:{' '}
            <strong>{sixMonths.toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>
          </p>
        </div>
      )}

      {/* Profile header */}
      <div className="rounded-xl border bg-card p-8 mb-6">
        <div className="flex items-start gap-6">
          <EmployeeAvatar
            firstName={employee.first_name}
            lastName={employee.last_name}
            avatarUrl={employee.avatar_url}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {employee.first_name} {employee.middle_name ? `${employee.middle_name} ` : ''}{employee.last_name}
                {employee.suffix ? `, ${employee.suffix}` : ''}
              </h1>
              <StatusBadge status={employee.status as EmployeeStatus} />
            </div>
            <p className="text-sm text-muted-foreground mb-4">{employee.employee_number}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              {jobTitleName && (
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faBriefcase} className="fa-xs" />
                  {jobTitleName}
                </span>
              )}
              {locationName && (
                <span className="flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faBuilding} className="fa-xs" />
                  {locationName}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCalendar} className="fa-xs" />
                Hired {new Date(employee.hire_date).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {/* Compensation — daily rate shown; monthly salary hidden for non-admin */}
            {employee.current_rate && employee.compensation_type === 'daily' && (
              <p className="mt-4 text-xl font-bold text-foreground">
                {formatCentavos(employee.current_rate.rate_centavos)}
                <span className="text-sm font-normal text-muted-foreground"> / day</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="details">
        <TabsList className="mb-6">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="rate-history">Rate History</TabsTrigger>
          <TabsTrigger value="status-history">Status History</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="rounded-xl border bg-card p-6 grid grid-cols-2 gap-x-8 gap-y-4">
            {[
              { label: 'Employment Type', value: employee.employment_type?.replace('_', ' ') },
              { label: 'Compensation Type', value: employee.compensation_type },
              { label: 'Email', value: employee.email },
              { label: 'Contact', value: employee.contact_number },
              { label: 'TIN', value: employee.tin },
              { label: 'SSS Number', value: employee.sss_number },
              { label: 'PhilHealth', value: employee.philhealth_number },
              { label: 'Pag-IBIG', value: employee.pagibig_number },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm text-foreground mt-0.5">{value ?? '—'}</p>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rate-history">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="divide-y">
              {rateHistory.map((rate) => (
                <div key={rate.id} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {formatCentavos(rate.rate_centavos)}
                      <span className="text-xs font-normal text-muted-foreground ml-1">
                        / {rate.compensation_type === 'daily' ? 'day' : 'month'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Effective {new Date(rate.effective_from).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {rate.effective_to
                        ? ` – ${new Date(rate.effective_to).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}`
                        : ' (current)'
                      }
                    </p>
                  </div>
                  {!rate.effective_to && (
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Current</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="status-history">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="divide-y">
              {(statusHistory ?? []).map((entry) => (
                <div key={entry.id} className="px-6 py-4">
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={entry.status as EmployeeStatus} />
                    <span className="text-xs text-muted-foreground">
                      {new Date(entry.effective_date).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                  {entry.reason && <p className="text-xs text-muted-foreground">{entry.reason}</p>}
                </div>
              ))}
              {!statusHistory?.length && (
                <div className="px-6 py-8 text-center text-sm text-muted-foreground">No status changes recorded.</div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </section>
  )
}
