import { requireTenant } from '@/platform/tenants'
import { getJobTitles } from '@/domains/hr/services/job-title-service'
import { PageHeader } from '@/components/shared/page-header'
import { JobTitlesContent } from './job-titles-content'

export default async function JobTitlesPage() {
  const { id: tenantId } = await requireTenant()
  const jobTitles = await getJobTitles(tenantId)

  return (
    <section>
      <div className="flex items-start justify-between mb-8">
        <PageHeader
          label="HR Settings"
          title="Job Titles"
          description="Create and manage job position titles in your organization."
          className="mb-0"
        />
      </div>
      <JobTitlesContent jobTitles={jobTitles} />
    </section>
  )
}
