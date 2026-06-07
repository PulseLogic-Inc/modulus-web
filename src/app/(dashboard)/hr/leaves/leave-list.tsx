'use client'

import { useState } from 'react'
import { faCalendarDays } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DataEmpty } from '@/components/shared/data-empty'
import { ApproveDialog } from './approve-dialog'
import { RejectDialog } from './reject-dialog'
import type { Database } from '@/types/supabase'

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']

interface LeaveListProps {
  requests: LeaveRequest[]
  isApprover: boolean
}

const LEAVE_TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  sil: {
    label: 'Service Incentive Leave',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: 'fa-briefcase',
  },
  vl: {
    label: 'Vacation Leave',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: 'fa-palmtree',
  },
  sl: {
    label: 'Sick Leave',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    icon: 'fa-hospital',
  },
  ml: {
    label: 'Maternity Leave',
    color: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400',
    icon: 'fa-heart',
  },
  pl: {
    label: 'Paternity Leave',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    icon: 'fa-user-tie',
  },
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
}

export function LeaveList({ requests, isApprover }: LeaveListProps) {
  const [selectedForApprove, setSelectedForApprove] = useState<LeaveRequest | null>(null)
  const [selectedForReject, setSelectedForReject] = useState<LeaveRequest | null>(null)

  if (requests.length === 0) {
    return (
      <DataEmpty
        icon={faCalendarDays}
        title="No pending leave requests"
        description="All leave requests have been processed."
      />
    )
  }

  return (
    <>
      <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
        <div className="divide-y">
          {requests.map((request) => {
            const typeConfig = LEAVE_TYPE_CONFIG[request.leave_type] || {
              label: 'Leave',
              color: 'bg-gray-100 text-gray-800',
              icon: 'fa-calendar',
            }
            const statusColor = STATUS_COLORS[request.status] || 'bg-gray-100'
            const startDate = new Date(request.start_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })
            const endDate = new Date(request.end_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
            const requestedDate = new Date(request.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div key={request.id} className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors">
                {/* Type Icon */}
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <i className={`fa-solid ${typeConfig.icon} text-muted-foreground fa-lg`}></i>
                </div>

                {/* Main Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold text-foreground">{typeConfig.label}</p>
                    <Badge variant="secondary" className={`text-xs border-0 ${typeConfig.color}`}>
                      {request.days}d {request.is_half_day ? '(half)' : ''}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{request.reason}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {startDate} – {endDate} | Requested: {requestedDate}
                  </p>
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
