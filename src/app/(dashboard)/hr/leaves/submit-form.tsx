'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { submitLeaveAction } from './actions/leave-actions'

interface SubmitLeaveFormProps {
  onSuccess?: () => void
}

const LEAVE_TYPES = [
  { value: 'sil', label: 'Service Incentive Leave (SIL)' },
  { value: 'vl', label: 'Vacation Leave (VL)' },
  { value: 'sl', label: 'Sick Leave (SL)' },
  { value: 'ml', label: 'Maternity Leave (ML)' },
  { value: 'pl', label: 'Paternity Leave (PL)' },
]

export function SubmitLeaveForm({ onSuccess }: SubmitLeaveFormProps) {
  const [state, action, isPending] = useActionState(
    submitLeaveAction,
    null as { error?: string; leaveRequestId?: string } | null
  )
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [days, setDays] = useState<number | ''>('')

  const handleDateChange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const diffMs = end.getTime() - start.getTime()
      const diffDays = diffMs / (1000 * 60 * 60 * 24) + 1
      setDays(Math.max(0.5, diffDays))
    }
  }

  return (
    <form action={action} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Leave Type */}
        <div className="space-y-2">
          <Label htmlFor="leave_type">Leave Type *</Label>
          <Select name="leave_type" defaultValue="vl">
            <SelectTrigger id="leave_type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              handleDateChange()
            }}
            required
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              handleDateChange()
            }}
            required
          />
        </div>

        {/* Days */}
        <div className="space-y-2">
          <Label htmlFor="days">Total Days *</Label>
          <Input
            id="days"
            name="days"
            type="number"
            value={days}
            onChange={(e) => setDays(Number(e.target.value) || '')}
            min="0.5"
            step="0.5"
            max="365"
            placeholder="Auto-calculated"
            required
          />
          <p className="text-xs text-muted-foreground">Inclusive of start and end dates</p>
        </div>
      </div>

      {/* Half Day Checkbox */}
      <div className="flex items-center gap-3">
        <Checkbox id="is_half_day" name="is_half_day" />
        <Label htmlFor="is_half_day" className="text-sm cursor-pointer">
          This is a half-day leave
        </Label>
      </div>

      {/* Reason */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Leave *</Label>
        <Textarea
          id="reason"
          name="reason"
          placeholder="Provide a reason for your leave request..."
          className="min-h-24"
          required
        />
        <p className="text-xs text-muted-foreground">Minimum 10 characters</p>
      </div>

      {/* Error Alert */}
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {state?.leaveRequestId && (
        <Alert className="bg-emerald-50 border-emerald-200">
          <AlertDescription className="text-emerald-800">
            ✓ Leave request submitted successfully. HR Admin will review and approve.
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
