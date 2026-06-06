'use client'

import { useActionState, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { changeEmployeeStatusAction } from '../actions/employee-actions'
import type { EmployeeStatus } from '@/domains/hr/types'

interface ChangeStatusDialogProps {
  employeeId: string
  currentStatus: EmployeeStatus
}

export function ChangeStatusDialog({ employeeId, currentStatus }: ChangeStatusDialogProps) {
  const [open, setOpen] = useState(false)
  const [state, action, isPending] = useActionState(
    (prev: { error?: string } | null, formData: FormData) => changeEmployeeStatusAction(employeeId, prev, formData),
    null
  )

  const handleSuccess = () => {
    if (!state?.error) {
      setOpen(false)
    }
  }

  // Re-run effect when state changes
  if (!isPending && !state?.error && open) {
    handleSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-2">
          <FontAwesomeIcon icon={faEllipsisVertical} className="fa-xs" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Change Employee Status</DialogTitle>
          <DialogDescription>
            Update the employee status and provide context for this change.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">New Status *</Label>
            <Select name="status" defaultValue={currentStatus} required>
              <SelectTrigger id="status"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="probationary">Probationary</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="awol">AWOL</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
                <SelectItem value="resigned">Resigned</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="effective_date">Effective Date *</Label>
            <Input
              id="effective_date"
              name="effective_date"
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="Optional note about why this status change occurred"
              className="min-h-24 resize-none"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive font-medium">{state.error}</p>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Updating…' : 'Update Status'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
