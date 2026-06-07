'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActionToast } from '@/hooks/use-action-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { recordClockOutAction } from '../actions/timekeeping-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClockSlash } from '@fortawesome/free-solid-svg-icons'
import type { ActionResult } from '@/lib/toast-server'

interface ClockOutDialogProps {
  employees: Array<{ id: string; first_name: string; last_name: string }>
  disabledEmployees?: string[]
}

export function ClockOutDialog({ employees, disabledEmployees = [] }: ClockOutDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const handleToast = useActionToast()

  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await recordClockOutAction(prev, formData)
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
        <Button variant="outline" className="gap-2">
          <FontAwesomeIcon icon={faClockSlash} />
          Clock Out
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clock Out</DialogTitle>
          <DialogDescription>Record your clock out time</DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee_id">Employee *</Label>
            <Select name="employee_id" required>
              <SelectTrigger id="employee_id"><SelectValue /></SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem
                    key={emp.id}
                    value={emp.id}
                    disabled={disabledEmployees.includes(emp.id)}
                  >
                    {emp.first_name} {emp.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="clock_out_time">Clock Out Time *</Label>
            <Input
              id="clock_out_time"
              name="clock_out_time"
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
              {isPending ? 'Clocking out...' : 'Clock Out'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
