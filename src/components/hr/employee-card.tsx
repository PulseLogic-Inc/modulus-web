import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faBriefcase } from '@fortawesome/free-solid-svg-icons'
import { Card, CardContent } from '@/components/ui/card'
import { EmployeeAvatar } from './employee-avatar'
import { StatusBadge } from './status-badge'
import { formatCentavos } from '@/lib/utils'
import type { Database } from '@/types/supabase'
import type { EmployeeStatus } from '@/domains/hr/types'

type EmployeeRow = Database['public']['Tables']['employees']['Row']

interface EmployeeCardProps {
  employee:     EmployeeRow
  rateCentavos?: number | null
  locationName?: string | null
  jobTitleName?: string | null
}

export function EmployeeCard({
  employee,
  rateCentavos,
  locationName,
  jobTitleName,
}: EmployeeCardProps) {
  return (
    <Link href={`/hr/${employee.id}`} className="block group">
      <Card className="rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md transition-shadow h-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <EmployeeAvatar
              firstName={employee.first_name}
              lastName={employee.last_name}
              avatarUrl={employee.avatar_url}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="text-sm font-bold tracking-tight text-foreground truncate group-hover:text-primary transition-colors">
                  {employee.first_name} {employee.last_name}
                </p>
                <StatusBadge status={employee.status as EmployeeStatus} />
              </div>

              <p className="text-xs text-muted-foreground mb-3">{employee.employee_number}</p>

              <div className="space-y-1">
                {jobTitleName && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FontAwesomeIcon icon={faBriefcase} className="fa-xs w-3 flex-shrink-0" />
                    <span className="truncate">{jobTitleName}</span>
                  </div>
                )}
                {locationName && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <FontAwesomeIcon icon={faBuilding} className="fa-xs w-3 flex-shrink-0" />
                    <span className="truncate">{locationName}</span>
                  </div>
                )}
              </div>

              {/* Daily rate shown only for daily compensation type (EMP-007) */}
              {employee.compensation_type === 'daily' && rateCentavos != null && (
                <p className="mt-3 text-sm font-semibold text-foreground">
                  {formatCentavos(rateCentavos)}
                  <span className="text-xs font-normal text-muted-foreground">/day</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
