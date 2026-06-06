'use client'

import { useActionState, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faPlay } from '@fortawesome/free-solid-svg-icons'
import { recordClockInAction } from './actions/timekeeping-actions'

interface ClockInDialogProps {
  employeeId: string
}

export function ClockInDialog({ employeeId }: ClockInDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(recordClockInAction, null)

  const currentTime = new Date().toLocaleTimeString('en-PH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

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
        <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700">
          <FontAwesomeIcon icon={faPlay} className="fa-xs" />
          Clock In
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Clock In</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <input type="hidden" name="employee_id" value={employeeId} />

          <div className="space-y-2">
            <Label htmlFor="clock_in_time">Time</Label>
            <Input
              id="clock_in_time"
              name="clock_in_time"
              type="time"
              defaultValue={currentTime}
              required
            />
            <p className="text-xs text-muted-foreground">
              Click the time field to adjust if needed
            </p>
          </div>

          {state?.error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              <FontAwesomeIcon icon={faClock} className="fa-xs" />
              {isPending ? 'Clocking In...' : 'Confirm Clock In'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
