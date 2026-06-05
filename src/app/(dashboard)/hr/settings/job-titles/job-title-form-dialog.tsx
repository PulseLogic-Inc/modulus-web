'use client'

import { useActionState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons'
import { createJobTitleAction, updateJobTitleAction } from './actions/job-title-actions'
import type { Database } from '@/types/supabase'

type JobTitleRow = Database['public']['Tables']['job_titles']['Row']

interface JobTitleFormDialogProps {
  mode:        'create' | 'edit'
  jobTitle?:   JobTitleRow
  asMenuItem?: boolean
}

export function JobTitleFormDialog({ mode, jobTitle, asMenuItem }: JobTitleFormDialogProps) {
  const action = mode === 'edit' && jobTitle
    ? updateJobTitleAction.bind(null, jobTitle.id)
    : createJobTitleAction

  const [state, formAction, isPending] = useActionState(action, null)

  const trigger = asMenuItem ? (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <FontAwesomeIcon icon={faPen} className="fa-xs mr-2" /> Edit
    </DropdownMenuItem>
  ) : (
    <Button size="sm" className="gap-2">
      <FontAwesomeIcon icon={faPlus} className="fa-sm" />
      Add Title
    </Button>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {mode === 'create' ? 'Add Job Title' : 'Edit Job Title'}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Title Name *</Label>
            <Input
              id="name"
              name="name"
              defaultValue={jobTitle?.name}
              placeholder="e.g. Software Engineer"
              required
            />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving…' : mode === 'create' ? 'Add Title' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
