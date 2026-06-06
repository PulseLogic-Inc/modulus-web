import Link from 'next/link'
import { requireTenant } from '@/platform/tenants'
import { getTimekeepingRecords, getIncompleteRecords } from '@/domains/timekeeping/services/timekeeping-service'
import { findEmployeeById } from '@/domains/hr/repositories/employee-repository'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faPlus, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { ClockInDialog } from './clock-in-dialog'
import { ClockOutDialog } from './clock-out-dialog'
import { RecordsList } from './records-list'

export default async function TimekeepingPage() {
  const { id: tenantId, userId } = await requireTenant()
  const supabase = await createServerSupabaseClient()

  // Fetch current user's profile to get employee ID (if applicable)
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()

  // For now, show all timekeeping records for the tenant (could be filtered to user's department later)
  // Get last 30 days of records
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fromDate = thirtyDaysAgo.toISOString().split('T')[0]
  const today = new Date().toISOString().split('T')[0]

  // Fetch incomplete records for alerts
  const incompleteRecords = await getIncompleteRecords(tenantId, today)

  // For MVP: Show the current user's timekeeping if they have a linked employee record
  // Otherwise, show a message to navigate to their employee record
  let todayRecord = null
  let recentRecords = []

  if (profile?.id) {
    try {
      // Try to find employee with matching user ID (would need a user_id column in employees table)
      // For MVP, just show recent records
      // TODO: Link profiles to employees table properly
    } catch (err) {
      // Employee not found - show placeholder
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          label="Operations"
          title="Timekeeping"
          description="Clock in, clock out, and manage daily work hours"
          className="mb-0"
        />
        <Link href="/timekeeping/manual-entry">
          <Button size="sm" variant="outline" className="gap-2">
            <FontAwesomeIcon icon={faPlus} className="fa-xs" />
            Manual Entry
          </Button>
        </Link>
      </div>

      {/* Incomplete records alert */}
      {incompleteRecords.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            {incompleteRecords.length} employee(s) have not completed their timekeeping for today.
            Check back later.
          </AlertDescription>
        </Alert>
      )}

      {/* Clock in/out quick actions (if user has employee record) */}
      {todayRecord ? (
        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-foreground">Today's Timekeeping</h3>
              <p className="text-sm text-muted-foreground mt-1">
                {new Date().toLocaleDateString('en-PH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <ClockInDialog employeeId="TODO-get-current-employee-id" />
            <ClockOutDialog
              employeeId="TODO-get-current-employee-id"
              clockInRecord={todayRecord}
            />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/50 p-6 text-center">
          <FontAwesomeIcon icon={faClock} className="fa-3x text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Clock in/out is available on your employee record detail page
          </p>
        </div>
      )}

      {/* Recent records summary */}
      <div>
        <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">Recent Records (Last 30 Days)</h3>
        <div className="text-center py-12">
          <FontAwesomeIcon icon={faClock} className="fa-3x text-muted-foreground mb-4" />
          <p className="text-sm text-muted-foreground">
            Timekeeping records will appear here as they are recorded
          </p>
        </div>
      </div>

      {/* Note: In production, fetch employee ID from auth context or tenant settings */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <p className="text-xs text-blue-800">
          <strong>Note:</strong> Clock in/out UI requires linking your user profile to an employee record.
          Contact your HR Admin to set this up.
        </p>
      </div>
    </section>
  )
}
