import { requireTenant } from '@/platform/tenants'
import { getContractRepository } from '@/domains/contracts/repositories/contract-repository'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { DataEmpty } from '@/components/shared/data-empty'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileContract, faEye } from '@fortawesome/free-solid-svg-icons'
import Link from 'next/link'
import type { Database } from '@/types/supabase'

type Contract = Database['public']['Tables']['contracts']['Row']

export default async function ContractsPage() {
  const { id: tenantId } = await requireTenant()
  const supabase = await createServerSupabaseClient()

  const { data: contracts } = await supabase
    .from('contracts')
    .select('*, employees(first_name, last_name)')
    .eq('tenant_id', tenantId)
    .eq('deleted_at', null)
    .order('created_at', { ascending: false })

  const statusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      case 'issued':
        return 'bg-green-100 text-green-800'
      case 'voided':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-blue-100 text-blue-800'
    }
  }

  return (
    <section className="space-y-6">
      <PageHeader
        label="HR"
        title="Employment Contracts"
        description="Manage employee contracts and agreements"
      />

      {!contracts || contracts.length === 0 ? (
        <DataEmpty
          icon={faFileContract}
          title="No contracts yet"
          description="Generate employment contracts for your employees"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract: any) => (
            <Card key={contract.id} className="rounded-xl border bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <FontAwesomeIcon icon={faFileContract} className="text-primary fa-lg" />
                    </div>
                    <div>
                      <p className="text-sm font-bold tracking-tight">
                        {contract.employees?.first_name} {contract.employees?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize mt-1">{contract.contract_type}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className={statusBadgeColor(contract.status)} variant="secondary">
                      {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Created:</span>
                    <span>
                      {new Date(contract.created_at).toLocaleDateString('en-PH', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <Link href={`/contracts/${contract.id}`}>
                  <Button size="sm" className="w-full gap-2">
                    <FontAwesomeIcon icon={faEye} className="fa-xs" />
                    View
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
