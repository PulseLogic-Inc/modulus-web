'use client'

import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { submitCorrectionAction } from './actions/correction-actions'

interface SubmitCorrectionFormProps {
  timekeepingRecordId: string
  currentValue: string
  correctionType: 'clock_in' | 'clock_out' | 'worked_minutes'
  onSuccess?: () => void
}

const TYPE_LABELS: Record<string, string> = {
  clock_in: 'Clock In Time',
  clock_out: 'Clock Out Time',
  worked_minutes: 'Worked Minutes',
}

const TYPE_PLACEHOLDERS: Record<string, string> = {
  clock_in: 'HH:mm (e.g., 09:00)',
  clock_out: 'HH:mm (e.g., 17:30)',
  worked_minutes: 'Number of minutes (e.g., 480)',
}

export function SubmitCorrectionForm({
  timekeepingRecordId,
  currentValue,
  correctionType,
  onSuccess,
}: SubmitCorrectionFormProps) {
  const [state, action, isPending] = useActionState(
    submitCorrectionAction,
    null as { error?: string; correctionId?: string } | null
  )

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="timekeeping_record_id" value={timekeepingRecordId} />
      <input type="hidden" name="correction_type" value={correctionType} />

      {/* Current Value (Display) */}
      <div className="space-y-2 rounded-lg bg-muted/50 p-4">
        <Label className="text-xs text-muted-foreground">Current Value</Label>
        <p className="text-lg font-semibold text-foreground">{currentValue}</p>
      </div>

      {/* Proposed Value */}
      <div className="space-y-2">
        <Label htmlFor="proposed_value">{TYPE_LABELS[correctionType]} *</Label>
        <Input
          id="proposed_value"
          name="proposed_value"
          type="text"
          placeholder={TYPE_PLACEHOLDERS[correctionType]}
          required
        />
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Correction *</Label>
        <Textarea
          id="reason"
          name="reason"
          placeholder="Explain why this correction is needed..."
          className="min-h-20"
          required
        />
      </div>

      {/* Error Alert */}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {state?.correctionId && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <AlertDescription className="text-emerald-800">
            ✓ Correction request submitted successfully. It will be reviewed by HR Admin.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4 border-t">
        <Button variant="outline" disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Submitting...' : 'Submit Request'}
        </Button>
      </div>
    </form>
  )
}
