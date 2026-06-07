'use client'

import { useActionState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { rejectCorrectionAction } from './actions/correction-actions'
import type { Database } from '@/types/supabase'

type CorrectionRequest = Database['public']['Tables']['hr_correction_requests']['Row']

interface RejectDialogProps {
  correction: CorrectionRequest
  onClose: () => void
}

export function RejectDialog({ correction, onClose }: RejectDialogProps) {
  const [state, action, isPending] = useActionState(
    (prev: { error?: string } | null, formData: FormData) =>
      rejectCorrectionAction(correction.id, prev, formData),
    null
  )

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Reject Correction</DialogTitle>
          <DialogDescription>
            Provide a reason for rejecting this timekeeping correction request.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 mt-4">
          {/* Correction Details */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-2">
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <p className="text-sm font-medium text-foreground">
                {correction.correction_type === 'clock_in'
                  ? 'Clock In'
                  : correction.correction_type === 'clock_out'
                    ? 'Clock Out'
                    : 'Worked Hours'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Requested Change</p>
              <p className="text-sm font-medium text-foreground">{correction.proposed_value}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reason Provided</p>
              <p className="text-sm text-foreground">{correction.reason}</p>
            </div>
          </div>

          {/* Rejection Reason */}
          <div className="space-y-2">
            <Label htmlFor="rejection_reason">Rejection Reason *</Label>
            <Textarea
              id="rejection_reason"
              name="rejection_reason"
              placeholder="Explain why this correction cannot be approved..."
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
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
            >
              {isPending ? 'Rejecting...' : 'Reject'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
