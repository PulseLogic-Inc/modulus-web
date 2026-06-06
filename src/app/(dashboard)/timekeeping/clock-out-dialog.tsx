'use client'

import { useActionState, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faStop, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { recordClockOutAction } from './actions/timekeeping-actions'
import type { Database } from '@/types/supabase'

type TimekeepingRecord = Database['public']['Tables']['timekeeping_records']['Row']

interface ClockOutDialogProps {
  employeeId: string
  clockInRecord?: TimekeepingRecord
}

export function ClockOutDialog({ employeeId, clockInRecord }: ClockOutDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(recordClockOutAction, null)

  const currentTime = new Date().toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  const isDisabled = !clockInRecord || clockInRecord.status !== 'incomplete'

  const handleSuccess = () => {
    if (!state?.error) {
      setOpen(false)
    }
  }

  if (!state?.error && open && isPending === false) {
    handleSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant={isDisabled ? 'secondary' : 'destructive'}
          className="gap-2"
          disabled={isDisabled}
        >
          <FontAwesomeIcon icon={faStop} className="fa-xs" />
          Clock Out
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clock Out</DialogTitle>
        </DialogHeader>

        {clockInRecord && (
          <div className="space-y-2 p-3 rounded-md bg-muted">
            <p className="text-xs text-muted-foreground">Clocked in at:</p>
            <p className="text-sm font-mono font-bold">{clockInRecord.clock_in}</p>
          </div>
        )}

        <form action={action} className="space-y-4">
          <input type="hidden" name="employee_id" value={employeeId} />

          <div className="space-y-2">
            <Label htmlFor="clock_out_time">Clock Out Time</Label>
            <Input
              id="clock_out_time"
              name="clock_out_time"
              type="time"
              defaultValue={currentTime}
              required
            />
            <p className="text-xs text-muted-foreground">
              Click the time field to adjust if needed
            </p>
          </div>

          {state?.error && (
            <Alert variant="destructive">
              <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4" />
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <Alert className="bg-blue-50 border-blue-200">
            <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-sm text-blue-800">
              Your worked hours will be calculated automatically. Anomalies (if any) will be flagged for review.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || isDisabled} className="gap-2">
              <FontAwesomeIcon icon={faClock} className="fa-xs" />
              {isPending ? 'Clocking Out...' : 'Confirm Clock Out'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
