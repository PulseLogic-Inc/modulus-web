'use client'

import { useActionState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { rejectLeaveAction } from './actions/leave-actions'
import type { Database } from '@/types/supabase'

type LeaveRequest = Database['public']['Tables']['leave_requests']['Row']

const LEAVE_TYPE_LABELS: Record<string, string> = {
  sil: 'Service Incentive Leave',
  vl: 'Vacation Leave',
  sl: 'Sick Leave',
  ml: 'Maternity Leave',
  pl: 'Paternity Leave',
}

interface RejectDialogProps {
  request: LeaveRequest
  onClose: () => void
}

export function RejectDialog({ request, onClose }: RejectDialogProps) {
  const [state, action, isPending] = useActionState(
    (prev: { error?: string } | null, formData: FormData) =>
      rejectLeaveAction(request.id, prev, formData),
    null as { error?: string } | null
  )

  const startDate = new Date(request.start_date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Reject Leave Request</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this leave request.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 mt-4">
          {/* Request Details */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
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
              <p className="text-xs text-muted-foreground">Requested From</p>
              <p className="text-sm text-foreground">{startDate}</p>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="rejection_reason">Rejection Reason *</Label>
            <Textarea
              id="rejection_reason"
              name="rejection_reason"
              placeholder="Explain why this leave request is being rejected..."
              className="min-h-24"
              required
            />
            <p className="text-xs text-muted-foreground">Minimum 10 characters required</p>
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
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Rejecting...' : 'Reject Leave'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
