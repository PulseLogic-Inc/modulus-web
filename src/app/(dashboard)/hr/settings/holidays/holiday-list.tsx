'use client'

import { useActionState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarDays, faPlus, faTrash, faLock, faSync } from '@fortawesome/free-solid-svg-icons'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { DataEmpty } from '@/components/shared/data-empty'
import { createHolidayAction, deleteHolidayAction, syncPhHolidaysAction } from './actions/holiday-actions'
import type { Database } from '@/types/supabase'

type HolidayRow = Database['public']['Tables']['company_holidays']['Row']

const HOLIDAY_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  regular_holiday:      { label: 'Regular Holiday',       color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  special_non_working:  { label: 'Special Non-Working',   color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' },
  special_working:      { label: 'Special Working',       color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  company_paid:         { label: 'Company Paid',          color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  company_unpaid:       { label: 'Company Unpaid',        color: 'bg-muted text-muted-foreground' },
}

function SyncPhHolidaysDialog() {
  const [state, action, isPending] = useActionState(syncPhHolidaysAction, null)
  const currentYear = new Date().getFullYear()

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-2">
          <FontAwesomeIcon icon={faSync} className="fa-sm" />
          Sync PH Holidays
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Sync PH Holidays</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              name="year"
              type="number"
              min="2000"
              max="2100"
              defaultValue={currentYear}
              required
            />
            <p className="text-xs text-muted-foreground">
              Fetches official Philippine statutory holidays for the selected year
            </p>
          </div>

          {state?.error && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          {state?.synced && (
            <Alert className="bg-emerald-50 border-emerald-200">
              <AlertDescription className="text-emerald-800">
                ✓ Successfully synced {state.synced} holidays for {currentYear}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Syncing…' : 'Sync Holidays'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function AddHolidayDialog() {
  const [state, action, isPending] = useActionState(createHolidayAction, null)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <FontAwesomeIcon icon={faPlus} className="fa-sm" />
          Add Custom Holiday
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight">Add Custom Holiday</DialogTitle>
        </DialogHeader>
        <form action={action} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date *</Label>
            <Input id="date" name="date" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" placeholder="e.g. Company Foundation Day" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select name="type" defaultValue="company_paid">
              <SelectTrigger id="type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="company_paid">Company Paid</SelectItem>
                <SelectItem value="company_unpaid">Company Unpaid</SelectItem>
                <SelectItem value="special_non_working">Special Non-Working</SelectItem>
                <SelectItem value="special_working">Special Working</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? 'Adding…' : 'Add Holiday'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function HolidayList({ holidays, year }: { holidays: HolidayRow[]; year: number }) {
  const statutoryCount = holidays.filter(h => h.source === 'statutory').length
  const customCount = holidays.filter(h => h.source === 'custom').length

  if (holidays.length === 0) {
    return (
      <DataEmpty
        icon={faCalendarDays}
        title={`No holidays for ${year}`}
        description="Sync PH statutory holidays, or add custom company holidays."
        action={<SyncPhHolidaysDialog />}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {holidays.length} total holidays {statutoryCount > 0 && `(${statutoryCount} statutory, ${customCount} custom)`}
          </p>
        </div>
        <div className="flex gap-2">
          <SyncPhHolidaysDialog />
          <AddHolidayDialog />
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="divide-y">
          {holidays.map((holiday) => {
            const typeConfig = HOLIDAY_TYPE_LABELS[holiday.type] ?? { label: holiday.type, color: 'bg-muted text-muted-foreground' }
            const isStatutory = holiday.source === 'statutory'

            return (
              <div key={holiday.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-20 flex-shrink-0">
                  <p className="text-sm font-mono text-muted-foreground">
                    {new Date(holiday.date + 'T00:00:00').toLocaleDateString('en-PH', { month: 'short', day: 'numeric' })}
                  </p>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground truncate">{holiday.name}</p>
                    {isStatutory && (
                      <FontAwesomeIcon icon={faLock} className="text-muted-foreground fa-xs flex-shrink-0" title="Statutory — read only" />
                    )}
                  </div>
                </div>

                <Badge variant="secondary" className={`text-xs border-0 flex-shrink-0 ${typeConfig.color}`}>
                  {typeConfig.label}
                </Badge>

                {!isStatutory && (
                  <form action={deleteHolidayAction.bind(null, holiday.id)}>
                    <Button type="submit" variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                      <FontAwesomeIcon icon={faTrash} className="fa-xs" />
                    </Button>
                  </form>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
