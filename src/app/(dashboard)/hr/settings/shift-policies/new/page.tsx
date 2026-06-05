import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { PageHeader } from '@/components/shared/page-header'
import { ShiftPolicyForm } from '../shift-policy-form'
import type { Enums } from '@/types/supabase'

export default async function CreateShiftPolicyPage() {
  const { role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  return (
    <section>
      <div className="mb-8">
        <PageHeader
          label="HR Settings / Shift Policies"
          title="Create Shift Policy"
          description="Define a new shift policy with schedule and settings."
        />
      </div>

      <div className="max-w-3xl">
        <ShiftPolicyForm mode="create" />
      </div>
    </section>
  )
}
