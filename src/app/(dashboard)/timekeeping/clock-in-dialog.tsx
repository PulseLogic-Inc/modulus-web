'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActionToast } from '@/hooks/use-action-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { recordClockInAction } from '../actions/timekeeping-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import type { ActionResult } from '@/lib/toast-server'

interface ClockInDialogProps {
  employees: Array<{ id: string; first_name: string; last_name: string }>
}

export function ClockInDialog({ employees }: ClockInDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const handleToast = useActionToast()

  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await recordClockInAction(prev, formData)
      handleToast(result)
      if (result?.success) {
        setOpen(false)
        router.refresh()
      }
      return result
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <FontAwesomeIcon icon={faClock} />
          Clock In
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clock In</DialogTitle>
          <DialogDescription>Record your clock in time for today</DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee *</Label>
            <Select name="employee_id" required>
              <SelectTrigger id="employee_id"><SelectValue /></SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clock_in_time">Clock In Time *</Label>
            <Input
              id="clock_in_time"
              name="clock_in_time"
              type="time"
              defaultValue={new Date().toTimeString().slice(0, 5)}
              required
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Clocking in...' : 'Clock In'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
