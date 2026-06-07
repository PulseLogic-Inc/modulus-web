'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActionToast } from '@/hooks/use-action-toast'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { changeEmployeeStatusAction } from '../actions/employee-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faToggleOn } from '@fortawesome/free-solid-svg-icons'
import type { ActionResult } from '@/lib/toast-server'
import type { EmployeeStatus } from '@/domains/hr/types'

interface ChangeStatusDialogProps {
  employeeId: string
  currentStatus: EmployeeStatus
}

export function ChangeStatusDialog({ employeeId, currentStatus }: ChangeStatusDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const handleToast = useActionToast()

  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await changeEmployeeStatusAction(employeeId, prev, formData)
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
        <Button size="sm" variant="outline" className="gap-2">
          <FontAwesomeIcon icon={faToggleOn} className="fa-xs" />
          Change Status
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Employee Status</DialogTitle>
          <DialogDescription>
            Update the employment status and effective date. A record will be created in status history.
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
