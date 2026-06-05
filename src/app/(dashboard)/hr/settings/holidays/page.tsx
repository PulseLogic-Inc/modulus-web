import { requireTenant } from '@/platform/tenants'
import { getHolidaysByYear } from '@/domains/hr/services/holiday-service'
import { PageHeader } from '@/components/shared/page-header'
import { HolidayList } from './holiday-list'

export default async function HolidaysPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>
}) {
  const params = await searchParams
  const { id: tenantId } = await requireTenant()
  const year = parseInt(params.year ?? String(new Date().getFullYear()), 10)
  const holidays = await getHolidaysByYear(tenantId, year)

  return (
    <section>
      <PageHeader
        label="HR Settings"
        title="Holiday Calendar"
        description="Philippine statutory holidays and company-specific non-working days."
      />
      <HolidayList holidays={holidays} year={year} />
    </section>
  )
}
