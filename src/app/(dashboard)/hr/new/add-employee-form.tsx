'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { createEmployeeAction } from '../actions/employee-actions'
import type { Database } from '@/types/supabase'

type WorkLocationRow = Database['public']['Tables']['work_locations']['Row']

interface AddEmployeeFormProps {
  locations:       WorkLocationRow[]
  suggestedNumber: string
}

export function AddEmployeeForm({ locations, suggestedNumber }: AddEmployeeFormProps) {
  const [state, action, isPending] = useActionState(createEmployeeAction, null)

  return (
    <form action={action} className="space-y-6">
      {/* Required fields */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-sm font-semibold text-foreground">Basic Information</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input id="first_name" name="first_name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input id="last_name" name="last_name" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="middle_name">Middle Name</Label>
            <Input id="middle_name" name="middle_name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix</Label>
            <Input id="suffix" name="suffix" placeholder="Jr., Sr., III" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee_number">Employee Number *</Label>
            <Input id="employee_number" name="employee_number" defaultValue={suggestedNumber} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date *</Label>
            <Input id="hire_date" name="hire_date" type="date" required />
          </div>
        </div>
      </div>

      {/* Employment details */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-sm font-semibold text-foreground">Employment</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employment_type">Employment Type *</Label>
            <Select name="employment_type" required>
              <SelectTrigger id="employment_type"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="probationary">Probationary</SelectItem>
                <SelectItem value="project_based">Project-Based</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="fixed_term">Fixed Term</SelectItem>
                <SelectItem value="contractual">Contractual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="work_location_id">Work Location *</Label>
            <Select name="work_location_id" required>
              <SelectTrigger id="work_location_id"><SelectValue placeholder="Select location" /></SelectTrigger>
              <SelectContent>
                {locations.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="compensation_type">Compensation Type *</Label>
            <Select name="compensation_type" required>
              <SelectTrigger id="compensation_type"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily Rate</SelectItem>
                <SelectItem value="monthly">Monthly Salary</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="rate_centavos">Rate (in centavos) *</Label>
            <Input
              id="rate_centavos"
              name="rate_centavos"
              type="number"
              min="1"
              placeholder="e.g. 69500 = ₱695.00"
              required
            />
            <p className="text-xs text-muted-foreground">Enter the rate in centavos. ₱695.00/day = 69500</p>
          </div>
        </div>
      </div>

      {/* Statutory IDs — optional at creation */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Statutory IDs</p>
          <p className="text-xs text-muted-foreground mt-1">Optional at creation. Required before first payroll run.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tin">TIN</Label>
            <Input id="tin" name="tin" placeholder="NNN-NNN-NNN-000" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sss_number">SSS Number</Label>
            <Input id="sss_number" name="sss_number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="philhealth_number">PhilHealth Number</Label>
            <Input id="philhealth_number" name="philhealth_number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pagibig_number">Pag-IBIG Number</Label>
            <Input id="pagibig_number" name="pagibig_number" />
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive font-medium">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Creating…' : 'Create Employee'}
        </Button>
        <Link href="/hr">
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  )
}
