import { PageHeader } from '@/components/shared/page-header'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers } from '@fortawesome/free-solid-svg-icons'

export default function HRPage() {
  return (
    <section>
      <PageHeader
        label="Human Resources"
        title="Employees"
        description="Manage your workforce, track status, and maintain employee records."
      />

      {/* Bento grid placeholder — feature work fills this in */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-3 rounded-xl border bg-card text-card-foreground shadow-sm p-8 flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4">
              <FontAwesomeIcon icon={faUsers} className="text-muted-foreground fa-lg" />
            </div>
            <p className="text-sm text-muted-foreground">
              Employee list coming in Phase 1 (EMP-001).
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
