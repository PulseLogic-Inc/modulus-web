'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActionToast } from '@/hooks/use-action-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileContract, faPlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { generateContractAction } from './actions/contract-actions'
import type { ActionResult } from '@/lib/toast-server'
import type { ContractType } from '@/domains/contracts/types'

interface GenerateContractDialogProps {
  employeeId: string
  employeeName: string
}

const CONTRACT_TYPES: { value: ContractType; label: string; description: string }[] = [
  {
    value: 'probationary',
    label: 'Probationary',
    description: '6-month probationary period; either party can terminate without cause',
  },
  {
    value: 'regular',
    label: 'Regular/Permanent',
    description: 'Permanent employment with all statutory benefits and separation pay',
  },
  {
    value: 'project_based',
    label: 'Project-Based',
    description: 'Employment for the duration of a specific project',
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'Temporary work; can be terminated anytime by either party',
  },
  {
    value: 'fixed_term',
    label: 'Fixed Term',
    description: 'Employment for a specified period or until completion of work',
  },
]

export function GenerateContractDialog({ employeeId, employeeName }: GenerateContractDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const handleToast = useActionToast()

  const [state, action, isPending] = useActionState<ActionResult | null, FormData>(
    async (prev: ActionResult | null, formData: FormData) => {
      const result = await generateContractAction(prev, formData)
      handleToast(result)
      if (result?.success) {
        setOpen(false)
        router.push(`/contracts/${result.data?.contractId}`)
      }
      return result
    },
    null
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <FontAwesomeIcon icon={faPlus} />
          Generate Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Contract</DialogTitle>
        </DialogHeader>

        <form action={action} className="space-y-4">
          <input type="hidden" name="employee_id" value={employeeId} />

          <div className="space-y-2">
            <Label>Employee</Label>
            <div className="text-sm font-medium">{employeeName}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="contract_type">Contract Type *</Label>
            <Select name="contract_type" required>
              <SelectTrigger id="contract_type"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <FontAwesomeIcon icon={faInfoCircle} className="text-blue-600" />
            <AlertDescription className="text-sm">
              A PH-standard employment contract will be generated based on your tenant configuration.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Generating...' : 'Generate'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
