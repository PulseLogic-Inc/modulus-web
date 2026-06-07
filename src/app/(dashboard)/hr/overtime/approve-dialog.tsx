'use client'

import { useActionState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { approveOvertimeAction } from './actions/overtime-actions'
import type { Database } from '@/types/supabase'

type OvertimeRequest = Database['public']['Tables']['overtime_requests']['Row']

interface ApproveDialogProps {
  request: OvertimeRequest
  onClose: () => void
}

export function ApproveDialog({ request, onClose }: ApproveDialogProps) {
  const [state, action, isPending] = useActionState(
    (prev: { error?: string } | null, formData: FormData) =>
      approveOvertimeAction(request.id, prev, formData),
    null as { error?: string } | null
  )

  const otDate = new Date(request.ot_date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Approve Overtime?</DialogTitle>
          <DialogDescription>
            Review and approve this overtime request with optional cost estimation.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4 mt-4">
          {/* Request Details */}
          <div className="rounded-lg bg-muted/50 p-4 space-y-3">
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
              <p className="text-xs text-muted-foreground">Date & Hours</p>
              <p className="text-sm font-medium text-foreground">
                {otDate} • {request.ot_hours}h
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reason</p>
              <p className="text-sm text-foreground">
                {request.reason_category}
                {request.reason_detail && ` — ${request.reason_detail}`}
              </p>
            </div>
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">Multiplier</p>
              <p className="text-sm font-medium text-foreground">{request.multiplier}×</p>
            </div>
          </div>

          {/* Cost Estimate Input */}
          <div className="space-y-2">
            <Label htmlFor="cost_estimate_centavos">Cost Estimate (₱)</Label>
            <Input
              id="cost_estimate_centavos"
              name="cost_estimate_centavos"
              type="number"
              placeholder="e.g., 1500.00"
              step="0.01"
              min="0"
              className="placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">Optional. Leave blank to not estimate cost.</p>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Approving...' : 'Approve Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
