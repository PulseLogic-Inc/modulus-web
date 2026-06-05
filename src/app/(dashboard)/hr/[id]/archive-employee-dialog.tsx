'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { archiveEmployeeAction } from '../actions/employee-actions'

interface ArchiveEmployeeDialogProps {
  employeeId: string
  employeeName: string
}

export function ArchiveEmployeeDialog({ employeeId, employeeName }: ArchiveEmployeeDialogProps) {
  const [isPending, startTransition] = useTransition()

  const handleArchive = () => {
    startTransition(async () => {
      await archiveEmployeeAction(employeeId)
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" className="gap-2">
          <FontAwesomeIcon icon={faTrash} className="fa-xs" />
          Archive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Employee?</AlertDialogTitle>
          <AlertDialogDescription>
            You're about to archive <strong>{employeeName}</strong>. This is a soft delete — the record will be hidden but not permanently removed. You can restore it later if needed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-3">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleArchive} disabled={isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {isPending ? 'Archiving…' : 'Archive'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
