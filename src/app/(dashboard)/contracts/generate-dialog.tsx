'use client'

import { useActionState, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileContract, faPlus, faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { generateContractAction } from './actions/contract-actions'
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
    label: 'Fixed-Term',
    description: 'Employment for a fixed duration; renewable upon mutual agreement',
  },
  {
    value: 'contractual',
    label: 'Contractual',
    description: 'Services rendered on a contractual basis',
  },
]

export function GenerateContractDialog({ employeeId, employeeName }: GenerateContractDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<ContractType>('regular')
  const [state, action, isPending] = useActionState(generateContractAction, null)

  const selectedTypeInfo = CONTRACT_TYPES.find((t) => t.value === selectedType)

  const handleSuccess = () => {
    if (!state?.error) {
      setOpen(false)
    }
  }

  if (!state?.error && open && isPending === false) {
    handleSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <FontAwesomeIcon icon={faPlus} className="fa-xs" />
          Generate Contract
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Employment Contract</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 p-3 rounded-md bg-muted">
          <p className="text-xs text-muted-foreground">For:</p>
          <p className="text-sm font-bold">{employeeName}</p>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="employee_id" value={employeeId} />

          <div className="space-y-2">
            <Label htmlFor="contract_type">Contract Type *</Label>
            <Select
              name="contract_type"
              value={selectedType}
              onValueChange={(value) => setSelectedType(value as ContractType)}
            >
              <SelectTrigger id="contract_type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CONTRACT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTypeInfo && (
            <Alert className="bg-blue-50 border-blue-200">
              <FontAwesomeIcon icon={faInfoCircle} className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-xs text-blue-800">
                {selectedTypeInfo.description}
              </AlertDescription>
            </Alert>
          )}

          {state?.error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          <Alert className="bg-amber-50 border-amber-200">
            <FontAwesomeIcon icon={faFileContract} className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-800">
              A draft contract will be created. You can review, modify, and issue it afterwards.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="gap-2">
              <FontAwesomeIcon icon={faFileContract} className="fa-xs" />
              {isPending ? 'Generating...' : 'Generate Contract'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
