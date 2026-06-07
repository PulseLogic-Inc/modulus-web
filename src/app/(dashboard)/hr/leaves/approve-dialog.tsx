'use client'
import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActionToast } from '@/hooks/use-action-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { approveLeaveAction } from './actions/leave-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import type { ActionResult } from '@/lib/toast-server'

export function ApproveDialog({ leaveId }: { leaveId: string }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const handleToast = useActionToast()
  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(async (prev: ActionResult | null, formData: FormData) => { const result = await approveLeaveAction(leaveId, prev, formData); handleToast(result); if (result?.success) { setOpen(false); router.refresh() }; return result }, null)
  return (<Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm" className="gap-2"><FontAwesomeIcon icon={faCheckCircle} className="fa-xs" />Approve</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Approve Leave Request</DialogTitle></DialogHeader><p className="text-sm text-muted-foreground mb-4">Approve this leave request?</p><form action={action} className="flex gap-3 justify-end"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button><Button type="submit" disabled={isPending}>{isPending ? 'Approving...' : 'Approve'}</Button></form></DialogContent></Dialog>)
}
