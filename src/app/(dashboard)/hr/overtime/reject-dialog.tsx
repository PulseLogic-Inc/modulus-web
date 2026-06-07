'use client'

import { useActionState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { rejectOvertimeAction } from './actions/overtime-actions'
import type { Database } from '@/types/supabase'

type OvertimeRequest = Database['public']['Tables']['overtime_requests']['Row']

interface RejectDialogProps {
  request: OvertimeRequest
  onClose: () => void
}

export function RejectDialog({ request, onClose }: RejectDialogProps) {
  const [state, action, isPending] = useActionState(
    (prev: { error?: string } | null, formData: FormData) =>
      rejectOvertimeAction(request.id, prev, formData),
    null as { error?: string } | null
  )

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Reject Overtime Request</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this overtime request.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 mt-4">
          {/* Request Details */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium text-foreground">
                {request.ot_type === 'regular'
                  ? 'Regular Day OT'
                  : request.ot_type === 'rest_day'
                    ? 'Rest Day OT'
                    : 'Holiday OT'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Requested Hours</p>
              <p className="text-sm font-medium text-foreground">{request.ot_hours}h × {request.multiplier}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reason</p>
              <p className="text-sm text-foreground">{request.reason_category}</p>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="rejection_reason">Rejection Reason *</Label>
            <Textarea
              id="rejection_reason"
              name="rejection_reason"
              placeholder="Explain why this overtime request cannot be approved..."
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
              {isPending ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
