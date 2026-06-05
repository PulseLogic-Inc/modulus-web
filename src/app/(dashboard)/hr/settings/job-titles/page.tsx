import { requireTenant } from '@/platform/tenants'
import { getJobTitles } from '@/domains/hr/services/job-title-service'
import { PageHeader } from '@/components/shared/page-header'
import { DataEmpty } from '@/components/shared/data-empty'
import { JobTitleCard } from './job-title-card'
import { JobTitleFormDialog } from './job-title-form-dialog'
import { faBriefcase } from '@fortawesome/free-solid-svg-icons'

export default async function JobTitlesPage() {
  const { id: tenantId } = await requireTenant()
  const jobTitles = await getJobTitles(tenantId)

  return (
    <section>
      <div className="flex items-start justify-between mb-8">
        <PageHeader
          label="HR Settings"
          title="Job Titles"
          description="Create and manage job title positions in your organization."
          className="mb-0"
        />
        <JobTitleFormDialog mode="create" />
      </div>

      {jobTitles.length === 0 ? (
        <DataEmpty
          icon={faBriefcase}
          title="No job titles yet"
          description="Add your first job title to start assigning employees to positions."
          action={<JobTitleFormDialog mode="create" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {jobTitles.map((title) => (
            <JobTitleCard key={title.id} jobTitle={title} />
          ))}
        </div>
      )}
    </section>
  )
}
