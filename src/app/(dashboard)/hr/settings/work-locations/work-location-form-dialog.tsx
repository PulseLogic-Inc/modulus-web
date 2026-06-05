'use client'

import { useActionState, useRef } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faPen } from '@fortawesome/free-solid-svg-icons'
import { createWorkLocationAction, updateWorkLocationAction } from './actions/work-location-actions'
import type { Database } from '@/types/supabase'

type WorkLocationRow = Database['public']['Tables']['work_locations']['Row']

const LOCATION_TYPES = [
  { value: 'head_office',  label: 'Head Office' },
  { value: 'branch',       label: 'Branch' },
  { value: 'store',        label: 'Store' },
  { value: 'office',       label: 'Office' },
  { value: 'project_site', label: 'Project Site' },
  { value: 'warehouse',    label: 'Warehouse' },
  { value: 'field',        label: 'Field' },
  { value: 'mobile',       label: 'Mobile' },
]

interface WorkLocationFormDialogProps {
  mode:       'create' | 'edit'
  location?:  WorkLocationRow
  asMenuItem?: boolean
}

export function WorkLocationFormDialog({ mode, location, asMenuItem }: WorkLocationFormDialogProps) {
  const action = mode === 'edit' && location
    ? updateWorkLocationAction.bind(null, location.id)
    : createWorkLocationAction

  const [state, formAction, isPending] = useActionState(action, null)

  const trigger = asMenuItem ? (
    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
      <FontAwesomeIcon icon={faPen} className="fa-xs mr-2" /> Edit
    </DropdownMenuItem>
  ) : (
    <Button size="sm" className="gap-2">
      <FontAwesomeIcon icon={faPlus} className="fa-sm" />
      Add Location
    </Button>
  )

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">
            {mode === 'create' ? 'Add Work Location' : 'Edit Work Location'}
          </DialogTitle>
        </DialogHeader>

        <form action={formAction} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" defaultValue={location?.name} placeholder="e.g. Main Office" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select name="type" defaultValue={location?.type ?? 'branch'} required>
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Code</Label>
            <Input id="code" name="code" defaultValue={location?.code ?? ''} placeholder="e.g. HO, BR01" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={location?.address ?? ''} placeholder="Full address" />
          </div>

          {state?.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Saving…' : mode === 'create' ? 'Add Location' : 'Save Changes'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
