import { useState } from 'react'
import Link from 'next/link'
import { requireTenant } from '@/platform/tenants'
import { requireRole } from '@/platform/permissions'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { ShiftPolicyForm } from '../shift-policy-form'
import { DeleteShiftPolicyDialog } from '../delete-shift-policy-dialog'
import { getShiftPolicy } from '@/domains/hr/services/shift-policy-service'
import { notFound } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import type { Enums } from '@/types/supabase'

interface EditShiftPolicyPageProps {
  params: Promise<{ id: string }>
}

export default async function EditShiftPolicyPage({ params }: EditShiftPolicyPageProps) {
  const { id: tenantId, role } = await requireTenant()
  requireRole(role as Enums<'user_role'>, ['owner', 'hr_admin'])

  const { id } = await params
  const policy = await getShiftPolicy(tenantId, id)

  if (!policy) {
    notFound()
  }

  return (
    <section>
      <div className="flex items-start justify-between mb-8">
        <div>
          <PageHeader
            label="HR Settings / Shift Policies"
            title="Edit Shift Policy"
            description={`Update shift policy: ${policy.name}`}
            className="mb-0"
          />
        </div>
        <DeleteButton policyId={policy.id} policyName={policy.name} />
      </div>

      <div className="max-w-3xl">
        <ShiftPolicyForm mode="edit" policy={policy} />
      </div>
    </section>
  )
}

function DeleteButton({ policyId, policyName }: { policyId: string; policyName: string }) {
  'use client'
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <FontAwesomeIcon icon={faTrash} className="fa-sm" />
        Delete
      </Button>
      <DeleteShiftPolicyDialog
        policyId={policyId}
        policyName={policyName}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}
