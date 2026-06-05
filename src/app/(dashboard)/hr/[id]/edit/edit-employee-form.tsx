'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { updateEmployeeAction } from '../../actions/employee-actions'
import { formatCentavos } from '@/lib/utils'
import type { Database } from '@/types/supabase'

type WorkLocationRow = Database['public']['Tables']['work_locations']['Row']
type JobTitleRow = Database['public']['Tables']['job_titles']['Row']

interface EditEmployeeFormProps {
  employee: Database['public']['Tables']['employees']['Row'] & { current_rate?: { rate_centavos: number } | null }
  locations: WorkLocationRow[]
  jobTitles: JobTitleRow[]
}

export function EditEmployeeForm({ employee, locations, jobTitles }: EditEmployeeFormProps) {
  const [state, action, isPending] = useActionState(
    (prev, formData) => updateEmployeeAction(employee.id, prev, formData),
    null
  )

  const rateCentavos = employee.current_rate?.rate_centavos ?? 0

  return (
    <form action={action} className="space-y-6">
      {/* Basic Information */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-sm font-semibold text-foreground">Basic Information</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name *</Label>
            <Input
              id="first_name"
              name="first_name"
              defaultValue={employee.first_name}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name *</Label>
            <Input
              id="last_name"
              name="last_name"
              defaultValue={employee.last_name}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="middle_name">Middle Name</Label>
            <Input
              id="middle_name"
              name="middle_name"
              defaultValue={employee.middle_name ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix</Label>
            <Input
              id="suffix"
              name="suffix"
              placeholder="Jr., Sr., III"
              defaultValue={employee.suffix ?? ''}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employee_number">Employee Number *</Label>
            <Input
              id="employee_number"
              name="employee_number"
              defaultValue={employee.employee_number}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hire_date">Hire Date *</Label>
            <Input
              id="hire_date"
              name="hire_date"
              type="date"
              defaultValue={new Date(employee.hire_date).toISOString().split('T')[0]}
              required
            />
          </div>
        </div>
      </div>

      {/* Employment details */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <p className="text-sm font-semibold text-foreground">Employment</p>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="employment_type">Employment Type *</Label>
            <Select name="employment_type" defaultValue={employee.employment_type} required>
              <SelectTrigger id="employment_type"><SelectValue /></SelectTrigger>
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
            <Select name="work_location_id" defaultValue={employee.work_location_id ?? ''} required>
              <SelectTrigger id="work_location_id"><SelectValue /></SelectTrigger>
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
            <Select name="compensation_type" defaultValue={employee.compensation_type} required>
              <SelectTrigger id="compensation_type"><SelectValue /></SelectTrigger>
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
              defaultValue={rateCentavos}
              placeholder="e.g. 69500 = ₱695.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              Current: {formatCentavos(rateCentavos)}. Rate changes close the current rate and create a new one.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="job_title_id">Job Title</Label>
          <Select name="job_title_id" defaultValue={employee.job_title_id ?? ''}>
            <SelectTrigger id="job_title_id"><SelectValue placeholder="Select job title" /></SelectTrigger>
            <SelectContent>
              {jobTitles.map((title) => (
                <SelectItem key={title.id} value={title.id}>{title.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Statutory IDs */}
      <div className="rounded-xl border bg-card p-6 space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground">Statutory IDs</p>
          <p className="text-xs text-muted-foreground mt-1">Required before first payroll run.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="tin">TIN</Label>
            <Input
              id="tin"
              name="tin"
              placeholder="NNN-NNN-NNN-000"
              defaultValue={employee.tin ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sss_number">SSS Number</Label>
            <Input
              id="sss_number"
              name="sss_number"
              defaultValue={employee.sss_number ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="philhealth_number">PhilHealth Number</Label>
            <Input
              id="philhealth_number"
              name="philhealth_number"
              defaultValue={employee.philhealth_number ?? ''}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pagibig_number">Pag-IBIG Number</Label>
            <Input
              id="pagibig_number"
              name="pagibig_number"
              defaultValue={employee.pagibig_number ?? ''}
            />
          </div>
        </div>
      </div>

      {state?.error && (
        <p className="text-sm text-destructive font-medium">{state.error}</p>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="flex-1">
          {isPending ? 'Saving…' : 'Save Changes'}
        </Button>
        <Link href={`/hr/${employee.id}`}>
          <Button type="button" variant="outline">Cancel</Button>
        </Link>
      </div>
    </form>
  )
}
