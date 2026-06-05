import { requireTenant } from '@/platform/tenants'
import { getShiftPolicies } from '@/domains/hr/services/shift-policy-service'
import { PageHeader } from '@/components/shared/page-header'
import { DataEmpty } from '@/components/shared/data-empty'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faPlus, faPen } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default async function ShiftPoliciesPage() {
  const { id: tenantId } = await requireTenant()
  const policies = await getShiftPolicies(tenantId)

  return (
    <section>
      <div className="flex items-start justify-between mb-8">
        <PageHeader
          label="HR Settings"
          title="Shift Policies"
          description="Reusable schedule templates assigned to employees."
          className="mb-0"
        />
        <Link href="/hr/settings/shift-policies/new">
          <Button size="sm" className="gap-2">
            <FontAwesomeIcon icon={faPlus} className="fa-sm" />
            Create Policy
          </Button>
        </Link>
      </div>

      {policies.length === 0 ? (
        <DataEmpty
          icon={faClock}
          title="No shift policies yet"
          description="Create a shift policy template to assign schedules to your employees."
          action={
            <Link href="/hr/settings/shift-policies/new">
              <Button size="sm">Create Policy</Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <Card key={policy.id} className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <FontAwesomeIcon icon={faClock} className="text-primary fa-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight text-foreground">{policy.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {policy.grace_period_min}min grace
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`text-xs border-0 ${
                      policy.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {policy.status}
                  </Badge>
                </div>

                {policy.night_diff_enabled && (
                  <p className="text-xs text-muted-foreground mb-4">
                    Night diff: {policy.night_diff_start} – {policy.night_diff_end}
                  </p>
                )}

                <Link href={`/hr/settings/shift-policies/${policy.id}`}>
                  <Button variant="outline" size="sm" className="w-full gap-2">
                    <FontAwesomeIcon icon={faPen} className="fa-xs" />
                    Edit Policy
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
