'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faCheckCircle, faTriangleExclamation, faClock as faClockEmpty } from '@fortawesome/free-solid-svg-icons'
import { formatCentavos } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type TimekeepingRecord = Database['public']['Tables']['timekeeping_records']['Row']

interface RecordsListProps {
  records: TimekeepingRecord[]
  isLoading?: boolean
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any; label: string }> = {
  incomplete: {
    bg: 'bg-amber-50 border-amber-200',
    text: 'text-amber-800',
    icon: faClockEmpty,
    label: 'Incomplete',
  },
  missing_clock: {
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon: faTriangleExclamation,
    label: 'Missing Clock',
  },
  complete: {
    bg: 'bg-emerald-50 border-emerald-200',
    text: 'text-emerald-800',
    icon: faCheckCircle,
    label: 'Complete',
  },
  payroll_ready: {
    bg: 'bg-blue-50 border-blue-200',
    text: 'text-blue-800',
    icon: faClock,
    label: 'Payroll Ready',
  },
  locked: {
    bg: 'bg-gray-50 border-gray-200',
    text: 'text-gray-800',
    icon: faClock,
    label: 'Locked',
  },
  on_leave: {
    bg: 'bg-purple-50 border-purple-200',
    text: 'text-purple-800',
    icon: faClock,
    label: 'On Leave',
  },
}

export function RecordsList({ records, isLoading }: RecordsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="rounded-xl border bg-card shadow-sm animate-pulse h-24" />
        ))}
      </div>
    )
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-12">
        <FontAwesomeIcon icon={faClock} className="fa-3x text-muted-foreground mb-4" />
        <p className="text-sm text-muted-foreground">No timekeeping records found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {records.map((record) => {
        const style = STATUS_STYLES[record.status] || STATUS_STYLES.complete
        const workedHours = record.worked_minutes ? Math.floor(record.worked_minutes / 60) : 0
        const workedMins = record.worked_minutes ? record.worked_minutes % 60 : 0

        return (
          <Card
            key={record.id}
            className={`rounded-xl border ${style.bg} shadow-sm overflow-hidden`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <FontAwesomeIcon icon={style.icon} className={`fa-sm ${style.text}`} />
                    <p className="font-mono font-bold text-sm">{record.date}</p>
                    <Badge variant="secondary" className="text-xs">
                      {style.label}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    {record.clock_in && (
                      <div>
                        <p className="text-muted-foreground">In</p>
                        <p className="font-mono font-bold text-sm">{record.clock_in}</p>
                      </div>
                    )}

                    {record.clock_out && (
                      <div>
                        <p className="text-muted-foreground">Out</p>
                        <p className="font-mono font-bold text-sm">{record.clock_out}</p>
                      </div>
                    )}

                    {record.worked_minutes !== null && (
                      <div>
                        <p className="text-muted-foreground">Worked</p>
                        <p className="font-mono font-bold text-sm">
                          {workedHours}h {workedMins}m
                        </p>
                      </div>
                    )}

                    {record.ot_minutes > 0 && (
                      <div>
                        <p className="text-muted-foreground">OT</p>
                        <p className="font-mono font-bold text-sm text-orange-600">
                          {Math.floor(record.ot_minutes / 60)}h {record.ot_minutes % 60}m
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {record.auto_flagged && (
                  <div className="flex-shrink-0">
                    <Badge variant="destructive" className="text-xs">
                      ⚠️ Flagged
                    </Badge>
                  </div>
                )}
              </div>

              {record.flag_reason && (
                <div className="mt-3 p-2 rounded bg-destructive/5 border border-destructive/10">
                  <p className="text-xs text-destructive">{record.flag_reason}</p>
                </div>
              )}

              {record.is_manual_entry && (
                <div className="mt-2 text-xs text-muted-foreground italic">
                  Manual entry (by system)
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
