import { requireTenant } from '@/platform/tenants'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers, faClock, faCalendarCheck, faDollarSign, faCheckCircle, faTimesCircle, faClipboardList } from '@fortawesome/free-solid-svg-icons'

export default async function DashboardPage() {
  const { id: tenantId } = await requireTenant()
  const supabase = await createServerSupabaseClient()

  // Fetch metrics
  const [
    { count: employeeCount },
    { count: presentToday },
    { count: onLeaveToday },
    { count: pendingCorrections },
    { count: pendingOT },
    { count: pendingLeaves },
    { count: draftPayroll },
  ] = await Promise.all([
    supabase.from('employees').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('deleted_at', null),
    supabase.from('timekeeping_records').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('date', new Date().toISOString().split('T')[0]),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'approved'),
    supabase.from('timekeeping_corrections').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'pending'),
    supabase.from('overtime_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'pending'),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'pending'),
    supabase.from('payroll_periods').select('id', { count: 'exact', head: true }).eq('tenant_id', tenantId).eq('status', 'draft'),
  ])

  const metrics = [
    { label: 'Total Employees', value: employeeCount || 0, icon: faUsers, color: 'bg-blue-100' },
    { label: 'Present Today', value: presentToday || 0, icon: faClock, color: 'bg-green-100' },
    { label: 'On Leave Today', value: onLeaveToday || 0, icon: faCalendarCheck, color: 'bg-yellow-100' },
    { label: 'Pending Corrections', value: pendingCorrections || 0, icon: faCheckCircle, color: 'bg-orange-100' },
    { label: 'Pending OT Requests', value: pendingOT || 0, icon: faDollarSign, color: 'bg-purple-100' },
    { label: 'Pending Leave Requests', value: pendingLeaves || 0, icon: faTimesCircle, color: 'bg-red-100' },
    { label: 'Draft Payroll Runs', value: draftPayroll || 0, icon: faClipboardList, color: 'bg-indigo-100' },
  ]

  return (
    <section className="space-y-6">
      <PageHeader label="Dashboard" title="HR Overview" description="Real-time metrics and pending approvals" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className={`w-10 h-10 rounded-lg ${metric.color} flex items-center justify-center`}>
                  <FontAwesomeIcon icon={metric.icon} className="text-foreground" />
                </div>
              </div>
              <div>
                <div className="text-3xl font-extrabold tracking-tight text-foreground">{metric.value}</div>
                <p className="text-xs text-muted-foreground mt-2">{metric.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
