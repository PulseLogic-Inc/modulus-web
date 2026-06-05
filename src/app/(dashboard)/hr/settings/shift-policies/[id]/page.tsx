import { notFound } from 'next/navigation'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { getShiftPolicy } from '@/domains/hr/services/shift-policy-service'
import { PageHeader } from '@/components/shared/page-header'
import { ShiftPolicyForm } from '../shift-policy-form'
import type { Enums } from '@/types/supabase'

export default async function EditShiftPolicyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { id: tenantId, role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const policy = await getShiftPolicy(tenantId, id)
  if (!policy) notFound()

  return (
    <section>
      <div className="mb-8">
        <PageHeader
          label="HR Settings / Shift Policies"
          title="Edit Shift Policy"
          description={`Updating ${policy.name}`}
        />
      </div>

      <div className="max-w-3xl">
        <ShiftPolicyForm mode="edit" policy={policy} />
      </div>
    </section>
  )
}
