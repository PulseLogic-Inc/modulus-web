'use client'

import { useActionState } from 'react'
import { useActionToast } from '@/hooks/use-action-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createJobTitleAction, updateJobTitleAction } from './actions/job-title-actions'
import type { ActionResult } from '@/lib/toast-server'
import type { Database } from '@/types/supabase'

type JobTitle = Database['public']['Tables']['job_titles']['Row']

interface JobTitleFormDialogProps {
  mode: 'create' | 'edit'
  jobTitle?: JobTitle
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function JobTitleFormDialog({
  mode,
  jobTitle,
  open,
  onOpenChange,
}: JobTitleFormDialogProps) {
  const handleToast = useActionToast()

  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await (mode === 'edit' && jobTitle
        ? updateJobTitleAction(jobTitle.id, prev, formData)
        : createJobTitleAction(prev, formData))
      handleToast(result)
      if (result?.success) {
        onOpenChange(false)
      }
      return result
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create Job Title' : 'Edit Job Title'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Add a new job title to your organization.'
              : `Update the job title "${jobTitle?.name}".`}
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Job Title Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Senior Developer"
              defaultValue={jobTitle?.name ?? ''}
              required
              disabled={isPending}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
