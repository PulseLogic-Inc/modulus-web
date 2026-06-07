'use client'

import { useActionState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { approveCorrectionAction } from './actions/correction-actions'
import type { Database } from '@/types/supabase'

type CorrectionRequest = Database['public']['Tables']['hr_correction_requests']['Row']

interface ApproveDialogProps {
  correction: CorrectionRequest
  onClose: () => void
}

export function ApproveDialog({ correction, onClose }: ApproveDialogProps) {
  const [state, action, isPending] = useActionState(
    () => approveCorrectionAction(correction.id),
    null as { error?: string } | null
  )

  if (!state?.error && !isPending) {
    // Initial state - show confirmation
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight">Approve Correction?</DialogTitle>
            <DialogDescription>
              This will apply the correction to the timekeeping record.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
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
                <p className="text-xs text-muted-foreground">Proposed Value</p>
                <p className="text-sm font-medium text-foreground">{correction.proposed_value}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Reason</p>
                <p className="text-sm text-foreground">{correction.reason}</p>
              </div>
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
                onClick={() => {
                  action()
                  onClose()
                }}
                disabled={isPending}
              >
                {isPending ? 'Approving...' : 'Approve'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return null
}
