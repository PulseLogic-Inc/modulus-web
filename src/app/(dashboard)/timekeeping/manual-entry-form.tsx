'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSave, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { manualEntryAction } from './actions/timekeeping-actions'

interface ManualEntryFormProps {
  employeeId: string
  employeeName: string
}

export function ManualEntryForm({ employeeId, employeeName }: ManualEntryFormProps) {
  const [state, action, isPending] = useActionState(manualEntryAction, null)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/timekeeping">
          <Button variant="outline" size="sm" className="gap-2">
            <FontAwesomeIcon icon={faArrowLeft} className="fa-xs" />
            Back
          </Button>
        </Link>
      </div>

      <Card className="rounded-xl border bg-card p-6 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">Manual Entry</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enter worked hours for {employeeName} on a past date
          </p>
        </div>

        <form action={action} className="space-y-4">
          <input type="hidden" name="employee_id" value={employeeId} />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                required
                defaultValue={new Date().toISOString().split('T')[0]}
              />
              <p className="text-xs text-muted-foreground">
                YYYY-MM-DD format
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="worked_minutes">Worked Minutes *</Label>
              <Input
                id="worked_minutes"
                name="worked_minutes"
                type="number"
                min="0"
                max="1440"
                placeholder="480 = 8 hours"
                required
              />
              <p className="text-xs text-muted-foreground">
                Total minutes (480 = 8h)
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              name="reason"
              placeholder="Why is this manual entry needed? (optional)"
              className="min-h-20 resize-none"
            />
          </div>

          {state?.error && (
            <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{state.error}</p>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <Link href="/timekeeping">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isPending} className="gap-2">
              <FontAwesomeIcon icon={faSave} className="fa-xs" />
              {isPending ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
