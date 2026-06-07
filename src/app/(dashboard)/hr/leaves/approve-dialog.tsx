'use client'

import { useActionState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { approveLeaveAction } from './actions/leave-actions'
import type { Database } from '@/types/supabase'

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']

const LEAVE_TYPE_LABELS: Record<string, string> = {
  sil: 'Service Incentive Leave',
  vl: 'Vacation Leave',
  sl: 'Sick Leave',
  ml: 'Maternity Leave',
  pl: 'Paternity Leave',
}

interface ApproveDialogProps {
  request: LeaveRequest
  onClose: () => void
}

export function ApproveDialog({ request, onClose }: ApproveDialogProps) {
  const [state, action, isPending] = useActionState(
    () => approveLeaveAction(request.id),
    null as { error?: string } | null
  )

  const startDate = new Date(request.start_date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const endDate = new Date(request.end_date).toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Approve Leave Request?</DialogTitle>
          <DialogDescription>
            Review and approve this leave request. The employee will be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Request Details */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
            <div>
              <p className="text-xs text-muted-foreground">Leave Type</p>
              <p className="text-sm font-medium text-foreground">
                {LEAVE_TYPE_LABELS[request.leave_type] || request.leave_type}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium text-foreground">
                {request.days} days {request.is_half_day ? '(half day)' : ''}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dates</p>
              <p className="text-sm text-foreground">
                {startDate} to {endDate}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reason</p>
              <p className="text-sm text-foreground">{request.reason}</p>
            </div>
          </div>

          {/* Error Alert */}
          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <form action={action}>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Approving...' : 'Approve Leave'}
              </Button>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
