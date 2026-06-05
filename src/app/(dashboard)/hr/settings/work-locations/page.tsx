import { requireTenant } from '@/platform/tenants'
import { getWorkLocations } from '@/domains/hr/services/work-location-service'
import { PageHeader } from '@/components/shared/page-header'
import { DataEmpty } from '@/components/shared/data-empty'
import { WorkLocationCard } from './work-location-card'
import { WorkLocationFormDialog } from './work-location-form-dialog'
import { faBuilding } from '@fortawesome/free-solid-svg-icons'

export default async function WorkLocationsPage() {
  const { id: tenantId } = await requireTenant()
  const locations = await getWorkLocations(tenantId)

  return (
    <section>
      <div className="flex items-start justify-between mb-8">
        <PageHeader
          label="HR Settings"
          title="Work Locations"
          description="Manage the branches, offices, and sites where your employees are assigned."
          className="mb-0"
        />
        <WorkLocationFormDialog mode="create" />
      </div>

      {locations.length === 0 ? (
        <DataEmpty
          icon={faBuilding}
          title="No work locations yet"
          description="Add your first work location to start assigning employees."
          action={<WorkLocationFormDialog mode="create" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <WorkLocationCard key={loc.id} location={loc} />
          ))}
        </div>
      )}
    </section>
  )
}
