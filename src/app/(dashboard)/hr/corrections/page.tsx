import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { PageHeader } from '@/components/shared/page-header'
import { CorrectionsList } from './corrections-list'
import { countByStatus, findPendingCorrections } from '@/domains/hr/repositories/correction-repository'
import type { Enums } from '@/types/supabase'

export default async function CorrectionsPage() {
  const { id: tenantId, role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const [pending, counts] = await Promise.all([
    findPendingCorrections(tenantId, 20),
    countByStatus(tenantId),
  ])

  return (
    <section>
      <PageHeader
        label="HR Operations"
        title="Pending Corrections"
        description="Review and approve timekeeping adjustments requested by staff."
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Pending Count */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <i className="fa-solid fa-clock text-amber-600 fa-lg"></i>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Pending</h3>
          </div>
          <div className="mt-8">
            <div className="text-5xl font-extrabold tracking-tight text-foreground">
              {counts.pending}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Awaiting review</p>
          </div>
        </div>

        {/* Approved Count */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <i className="fa-solid fa-check text-emerald-600 fa-lg"></i>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Approved</h3>
          </div>
          <div className="mt-8">
            <div className="text-5xl font-extrabold tracking-tight text-foreground">
              {counts.approved}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">This month</p>
          </div>
        </div>

        {/* Rejected Count */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
              <i className="fa-solid fa-xmark text-red-600 fa-lg"></i>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground">Rejected</h3>
          </div>
          <div className="mt-8">
            <div className="text-5xl font-extrabold tracking-tight text-foreground">
              {counts.rejected}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">This month</p>
          </div>
        </div>
      </div>

      {/* Pending Corrections List */}
      <CorrectionsList corrections={pending} isApprover={true} />
    </section>
  )
}
