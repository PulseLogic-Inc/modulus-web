'use client'

import { useTransition } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcase, faEllipsis, faTrash } from '@fortawesome/free-solid-svg-icons'
import { Card, CardContent } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { JobTitleFormDialog } from './job-title-form-dialog'
import { deleteJobTitleAction } from './actions/job-title-actions'
import type { Database } from '@/types/supabase'

type JobTitleRow = Database['public']['Tables']['job_titles']['Row']

export function JobTitleCard({ jobTitle }: { jobTitle: JobTitleRow }) {
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      await deleteJobTitleAction(jobTitle.id)
    })
  }

  return (
    <Card className="rounded-xl border bg-card text-card-foreground shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <FontAwesomeIcon icon={faBriefcase} className="text-primary fa-lg" />
            </div>
            <p className="text-sm font-bold tracking-tight text-foreground truncate">
              {jobTitle.name}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0" disabled={isPending}>
                <FontAwesomeIcon icon={faEllipsis} className="fa-sm" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <JobTitleFormDialog mode="edit" jobTitle={jobTitle} asMenuItem />
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 text-destructive focus:text-destructive w-full text-left"
              >
                <FontAwesomeIcon icon={faTrash} className="fa-xs mr-2" />
                Delete
              </button>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
