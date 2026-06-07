'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteShiftPolicyAction } from './actions/shift-policy-actions'

interface DeleteShiftPolicyDialogProps {
  policyId: string
  policyName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteShiftPolicyDialog({
  policyId,
  policyName,
  open,
  onOpenChange,
}: DeleteShiftPolicyDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    startTransition(async () => {
      try {
        await deleteShiftPolicyAction(policyId)
        toast.success('Shift policy deleted successfully!')
        router.push('/hr/settings/shift-policies')
      } catch (err) {
        toast.error('Failed to delete shift policy')
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Shift Policy</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground">"{policyName}"</span>?
            <br />
            <span className="text-sm text-destructive mt-2 block">
              This action cannot be undone. Employees assigned to this policy will need to be reassigned.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
