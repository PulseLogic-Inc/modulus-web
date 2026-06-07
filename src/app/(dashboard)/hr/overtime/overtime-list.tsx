'use client'

import { useState } from 'react'
import { faClipboard } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataEmpty } from '@/components/shared/data-empty'
import { ApproveDialog } from './approve-dialog'
import { RejectDialog } from './reject-dialog'
import type { Database } from '@/types/supabase'

type OvertimeRequest = Database['public']['Tables']['overtime_requests']['Row']

interface OvertimeListProps {
  requests: OvertimeRequest[]
  isApprover: boolean
}

const OT_TYPE_CONFIG: Record<string, { icon: string; label: string; color: string }> = {
  regular: {
    icon: 'fa-calendar-day',
    label: 'Regular Day',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  rest_day: {
    icon: 'fa-moon',
    label: 'Rest Day',
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  },
  holiday: {
    icon: 'fa-star',
    label: 'Holiday',
    color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  },
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function OvertimeList({ requests, isApprover }: OvertimeListProps) {
  const [selectedForApprove, setSelectedForApprove] = useState<OvertimeRequest | null>(null)
  const [selectedForReject, setSelectedForReject] = useState<OvertimeRequest | null>(null)

  if (requests.length === 0) {
    return (
      <DataEmpty
        icon={faClipboard}
        title="No pending overtime requests"
        description="All overtime requests have been processed."
      />
    )
  }

  return (
    <>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="divide-y">
          {requests.map((request) => {
            const typeConfig = OT_TYPE_CONFIG[request.ot_type] || {
              icon: 'fa-clock',
              label: 'Unknown',
              color: 'bg-gray-100 text-gray-800',
            }
            const statusColor = STATUS_COLORS[request.status] || 'bg-gray-100'
            const requestedDate = new Date(request.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
            const otDate = new Date(request.ot_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })
            const costDisplay = request.estimated_cost_centavos
              ? `₱${(request.estimated_cost_centavos / 100).toFixed(2)}`
              : 'Not estimated'

            return (
              <div
                key={request.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors"
              >
                {/* Type Icon */}
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${typeConfig.icon} text-muted-foreground fa-lg`}></i>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{typeConfig.label} OT</p>
                    <Badge variant="secondary" className={`text-xs border-0 ${typeConfig.color}`}>
                      {request.ot_hours}h × {request.multiplier}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {request.reason_category} {request.reason_detail ? `— ${request.reason_detail}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    OT Date: {otDate} | Requested: {requestedDate}
                  </p>
                </div>

                {/* Cost Estimate */}
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">Est. Cost</p>
                  <p className="text-sm font-semibold text-foreground">{costDisplay}</p>
                </div>

                {/* Status Badge */}
                <Badge variant="secondary" className={`text-xs border-0 ${statusColor} flex-shrink-0`}>
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </Badge>

                {/* Actions (HR Admin Only) */}
                {isApprover && request.status === 'pending' && (
                  <div className="flex gap-2 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => setSelectedForApprove(request)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs text-destructive hover:text-destructive"
                      onClick={() => setSelectedForReject(request)}
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
          request={selectedForApprove}
          onClose={() => setSelectedForApprove(null)}
        />
      )}
      {selectedForReject && (
        <RejectDialog
          request={selectedForReject}
          onClose={() => setSelectedForReject(null)}
        />
      )}
    </>
  )
}
