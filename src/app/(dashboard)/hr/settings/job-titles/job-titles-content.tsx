'use client'

import { useState } from 'react'
import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { deleteJobTitleAction } from './actions/job-title-actions'
import { DataEmpty } from '@/components/shared/data-empty'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { JobTitleFormDialog } from './job-title-form-dialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBriefcase, faPlus, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { Database } from '@/types/supabase'

type JobTitle = Database['public']['Tables']['job_titles']['Row']

interface JobTitlesContentProps {
  jobTitles: JobTitle[]
}

export function JobTitlesContent({ jobTitles }: JobTitlesContentProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTitle, setEditingTitle] = useState<JobTitle | undefined>(undefined)

  const handleDelete = (id: string) => {
    startTransition(async () => {
      try {
        await deleteJobTitleAction(id)
        router.refresh()
      } catch (err) {
        toast.error('Failed to delete job title')
      }
    })
  }

  const handleEdit = (jobTitle: JobTitle) => {
    setEditingTitle(jobTitle)
    setDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingTitle(undefined)
    setDialogOpen(true)
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button size="sm" className="gap-2" onClick={handleCreate}>
          <FontAwesomeIcon icon={faPlus} className="fa-sm" />
          Create Title
        </Button>
      </div>

      {jobTitles.length === 0 ? (
        <DataEmpty
          icon={faBriefcase}
          title="No job titles yet"
          description="Create job titles to assign positions to your employees."
          action={
            <Button size="sm" onClick={handleCreate}>
              Create Title
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobTitles.map((jobTitle) => (
            <Card key={jobTitle.id} className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <FontAwesomeIcon icon={faBriefcase} className="text-primary fa-lg" />
                    </div>
                    <p className="text-sm font-bold tracking-tight text-foreground">{jobTitle.name}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2"
                    onClick={() => handleEdit(jobTitle)}
                    disabled={isPending}
                  >
                    <FontAwesomeIcon icon={faPen} className="fa-xs" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(jobTitle.id)}
                    disabled={isPending}
                  >
                    <FontAwesomeIcon icon={faTrash} className="fa-xs" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <JobTitleFormDialog
        mode={editingTitle ? 'edit' : 'create'}
        jobTitle={editingTitle}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  )
}
