import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EmployeeStatus } from '@/domains/hr/types'

const STATUS_CONFIG: Record<EmployeeStatus, { label: string; className: string }> = {
  active:        { label: 'Active',        className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  probationary:  { label: 'Probationary',  className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  on_leave:      { label: 'On Leave',      className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  awol:          { label: 'AWOL',          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  suspended:     { label: 'Suspended',     className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  terminated:    { label: 'Terminated',    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  resigned:      { label: 'Resigned',      className: 'bg-muted text-muted-foreground' },
  inactive:      { label: 'Inactive',      className: 'bg-muted text-muted-foreground' },
}

interface StatusBadgeProps {
  status:    EmployeeStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-muted text-muted-foreground' }

  return (
    <Badge
      variant="secondary"
      className={cn('text-xs font-medium border-0', config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
