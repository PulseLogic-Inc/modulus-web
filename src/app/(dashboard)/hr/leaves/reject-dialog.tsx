'use client'
import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActionToast } from '@/hooks/use-action-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { rejectLeaveAction } from './actions/leave-actions'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmarkCircle } from '@fortawesome/free-solid-svg-icons'
import type { ActionResult } from '@/lib/toast-server'

export function RejectDialog({ leaveId }: { leaveId: string }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const handleToast = useActionToast()
  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(async (prev: ActionResult | null, formData: FormData) => { const result = await rejectLeaveAction(leaveId, prev, formData); handleToast(result); if (result?.success) { setOpen(false); router.refresh() }; return result }, null)
  return (<Dialog open={open} onOpenChange={setOpen}><DialogTrigger asChild><Button size="sm" variant="destructive" className="gap-2"><FontAwesomeIcon icon={faXmarkCircle} className="fa-xs" />Reject</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Reject Leave Request</DialogTitle></DialogHeader><form action={action} className="space-y-4"><div className="space-y-2"><Label htmlFor="reason">Reason *</Label><Textarea id="reason" name="reason" placeholder="Why are you rejecting this request?" className="min-h-24" required /></div><div className="flex gap-3 justify-end"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button><Button type="submit" disabled={isPending}>{isPending ? 'Rejecting...' : 'Reject'}</Button></div></form></DialogContent></Dialog>)
}
