import { requireTenant } from '@/platform/tenants'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileText, faDownload } from '@fortawesome/free-solid-svg-icons'

export default async function ReportsPage() {
  const { id: tenantId } = await requireTenant()
  const currentYear = new Date().getFullYear()

  const reports = [
    { name: 'SSS R-3 Report', desc: 'Monthly SSS remittance', type: 'sss' },
    { name: 'PhilHealth RF-1', desc: 'PhilHealth premium remittance', type: 'philhealth' },
    { name: 'Pag-IBIG MCRF', desc: 'Pag-IBIG monthly contribution', type: 'pagibig' },
  ]

  return (
    <section className="space-y-6">
      <PageHeader label="Finance" title="Government Reports" description="Generate and export statutory remittance reports" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.type} className="rounded-xl border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center"><FontAwesomeIcon icon={faFileText} className="text-primary fa-lg" /></div><div><p className="text-sm font-bold">{report.name}</p><p className="text-xs text-muted-foreground mt-1">{report.desc}</p></div></div>
              </div>
              <Button size="sm" className="w-full gap-2"><FontAwesomeIcon icon={faDownload} className="fa-xs" />Download {currentYear}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
