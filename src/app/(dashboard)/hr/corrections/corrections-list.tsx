'use client'

import { useState } from 'react'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataEmpty } from '@/components/shared/data-empty'
import { ApproveDialog } from './approve-dialog'
import { RejectDialog } from './reject-dialog'
import type { Database } from '@/types/supabase'

type CorrectionRequest = Database['public']['Tables']['hr_correction_requests']['Row']

interface CorrectionsListProps {
  corrections: CorrectionRequest[]
  isApprover: boolean
}

const TYPE_ICONS: Record<string, { icon: string; label: string; color: string }> = {
  clock_in: {
    icon: 'fa-clock',
    label: 'Clock In',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  clock_out: {
    icon: 'fa-door-open',
    label: 'Clock Out',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  },
  worked_minutes: {
    icon: 'fa-hourglass-end',
    label: 'Worked Hours',
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  },
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function CorrectionsList({ corrections, isApprover }: CorrectionsListProps) {
  const [selectedForApprove, setSelectedForApprove] = useState<CorrectionRequest | null>(null)
  const [selectedForReject, setSelectedForReject] = useState<CorrectionRequest | null>(null)

  if (corrections.length === 0) {
    return (
      <DataEmpty
        icon={faCheckCircle}
        title="No pending corrections"
        description="All timekeeping corrections have been processed."
      />
    )
  }

  return (
    <>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="divide-y">
          {corrections.map((correction) => {
            const typeConfig = TYPE_ICONS[correction.correction_type] || {
              icon: 'fa-pencil',
              label: 'Unknown',
              color: 'bg-gray-100 text-gray-800',
            }
            const statusColor = STATUS_COLORS[correction.status] || 'bg-gray-100'
            const createdDate = new Date(correction.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div key={correction.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
                {/* Type Icon */}
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${typeConfig.icon} text-muted-foreground fa-lg`}></i>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{typeConfig.label}</p>
                    <Badge variant="secondary" className={`text-xs border-0 ${typeConfig.color}`}>
                      {correction.proposed_value}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{correction.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">{createdDate}</p>
                </div>

                {/* Status Badge */}
                <Badge variant="secondary" className={`text-xs border-0 ${statusColor} flex-shrink-0`}>
                  {correction.status.charAt(0).toUpperCase() + correction.status.slice(1)}
                </Badge>

                {/* Actions (HR Admin Only) */}
                {isApprover && correction.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => setSelectedForApprove(correction)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs text-destructive hover:text-destructive"
                      onClick={() => setSelectedForReject(correction)}
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Dialogs */}
      {selectedForApprove && (
        <ApproveDialog
          correction={selectedForApprove}
          onClose={() => setSelectedForApprove(null)}
        />
      )}
      {selectedForReject && (
        <RejectDialog
          correction={selectedForReject}
          onClose={() => setSelectedForReject(null)}
        />
      )}
    </>
  )
}
