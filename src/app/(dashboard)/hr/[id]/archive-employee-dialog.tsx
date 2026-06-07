'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { archiveEmployeeAction } from '../actions/employee-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArchive } from '@fortawesome/free-solid-svg-icons'

interface ArchiveEmployeeDialogProps {
  employeeId: string
  employeeName: string
}

export function ArchiveEmployeeDialog({ employeeId, employeeName }: ArchiveEmployeeDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleArchive = () => {
    startTransition(async () => {
      try {
        const result = await archiveEmployeeAction(employeeId)
        if (result?.success) {
          toast.success('Employee archived!')
          router.push('/hr')
        } else {
          toast.error(result?.error || 'Failed to archive employee')
        }
      } catch (err) {
        toast.error('Failed to archive employee')
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="destructive" className="gap-2">
          <FontAwesomeIcon icon={faArchive} className="fa-xs" />
          Archive
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Archive Employee</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to archive <span className="font-semibold text-foreground">"{employeeName}"</span>?
            <br />
            <span className="text-sm text-destructive mt-2 block">
              This action cannot be undone. The employee will be removed from payroll and HR records.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleArchive}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Archiving...' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
