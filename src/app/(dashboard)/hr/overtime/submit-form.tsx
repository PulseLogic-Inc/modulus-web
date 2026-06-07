'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { submitOvertimeAction } from './actions/overtime-actions'

interface SubmitOvertimeFormProps {
  onSuccess?: () => void
}

const MULTIPLIERS: Record<string, { label: string; value: number }> = {
  regular: { label: 'Regular Day (1.25×)', value: 1.25 },
  rest_day: { label: 'Rest Day (1.30× or 1.69×)', value: 1.3 },
  holiday: { label: 'Holiday (2.00× or 2.60×)', value: 2.0 },
}

export function SubmitOvertimeForm({ onSuccess }: SubmitOvertimeFormProps) {
  const [otType, setOtType] = useState<string>('regular')
  const [state, action, isPending] = useActionState(
    submitOvertimeAction,
    null as { error?: string; overtimeId?: string } | null
  )

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* OT Date */}
        <div className="space-y-2">
          <Label htmlFor="ot_date">Overtime Date *</Label>
          <Input id="ot_date" name="ot_date" type="date" required />
        </div>

        {/* OT Hours */}
        <div className="space-y-2">
          <Label htmlFor="ot_hours">Hours Requested *</Label>
          <Input
            id="ot_hours"
            name="ot_hours"
            type="number"
            placeholder="e.g., 2"
            min="0.5"
            max="24"
            step="0.5"
            required
          />
          <p className="text-xs text-muted-foreground">Minimum 0.5 hours</p>
        </div>

        {/* OT Type */}
        <div className="space-y-2">
          <Label htmlFor="ot_type">OT Type *</Label>
          <Select name="ot_type" defaultValue="regular" onValueChange={setOtType}>
            <SelectTrigger id="ot_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular Day</SelectItem>
              <SelectItem value="rest_day">Rest Day</SelectItem>
              <SelectItem value="holiday">Holiday</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Multiplier (auto-calculated) */}
        <div className="space-y-2">
          <Label htmlFor="multiplier">Multiplier *</Label>
          <Input
            id="multiplier"
            name="multiplier"
            type="number"
            value={MULTIPLIERS[otType]?.value || 1.25}
            step="0.01"
            readOnly
            className="bg-muted"
          />
          <p className="text-xs text-muted-foreground">{MULTIPLIERS[otType]?.label || 'Auto-calculated'}</p>
        </div>
      </div>

      {/* Reason Category */}
      <div className="space-y-2">
        <Label htmlFor="reason_category">Reason Category *</Label>
        <Input
          id="reason_category"
          name="reason_category"
          type="text"
          placeholder="e.g., Urgent Project, Month-End Closing"
          required
        />
      </div>

      {/* Reason Detail */}
      <div className="space-y-2">
        <Label htmlFor="reason_detail">Additional Details</Label>
        <Textarea
          id="reason_detail"
          name="reason_detail"
          placeholder="Provide more context about why overtime is needed..."
          className="min-h-20"
        />
      </div>

      {/* Error Alert */}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {state?.overtimeId && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <AlertDescription className="text-emerald-800">
            ✓ Overtime request submitted successfully. HR Admin will review and approve.
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
