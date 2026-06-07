import { requireTenant } from '@/platform/tenants'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoneyBill, faEye } from '@fortawesome/free-solid-svg-icons'

export default async function PayrollPage() {
  const { id: tenantId } = await requireTenant()
  const supabase = await createServerSupabaseClient()
  const { data: periods } = await supabase.from('payroll_periods').select('*').eq('tenant_id', tenantId).eq('deleted_at', null).order('period_end_date', { ascending: false })

  return (
    <section className="space-y-6">
      <PageHeader label="Finance" title="Payroll" description="Manage payroll periods, generate runs, and finalize payments" />
      {!periods || periods.length === 0 ? (
        <Card className="p-8 text-center"><p className="text-muted-foreground">No payroll periods created yet</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {periods.map((p: any) => (
            <Card key={p.id} className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><FontAwesomeIcon icon={faMoneyBill} className="text-primary fa-lg" /></div><div><p className="text-sm font-bold">{p.period_code}</p><p className="text-xs text-muted-foreground mt-1">{new Date(p.period_end_date).toLocaleDateString('en-PH')}</p></div></div><Badge className="capitalize">{p.status}</Badge>
                </div>
                <Link href={`/payroll/${p.id}`}><Button size="sm" className="w-full gap-2"><FontAwesomeIcon icon={faEye} className="fa-xs" />View</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
