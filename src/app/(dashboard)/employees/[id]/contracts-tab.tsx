'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileContract, faPlus, faDownload, faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { GenerateContractDialog } from '@/app/(dashboard)/contracts/generate-dialog'
import { DataEmpty } from '@/components/shared/data-empty'
import type { Database } from '@/types/supabase'

type EmploymentContract = Database['public']['Tables']['employment_contracts']['Row']

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
  issued: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Issued' },
  signed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Signed' },
  superseded: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Superseded' },
  voided: { bg: 'bg-red-100', text: 'text-red-800', label: 'Voided' },
}

interface ContractsTabProps {
  employeeId: string
  employeeName: string
  contracts: EmploymentContract[]
  canGenerate?: boolean
}

export function ContractsTab({
  employeeId,
  employeeName,
  contracts,
  canGenerate = false,
}: ContractsTabProps) {
  const activeContract = contracts.find((c) => ['draft', 'issued', 'signed'].includes(c.status))
  const contractHistory = contracts.filter((c) => ['superseded', 'voided'].includes(c.status))

  return (
    <div className="space-y-6">
      {/* Active Contract */}
      {activeContract ? (
        <Card className="rounded-xl border bg-card p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                <FontAwesomeIcon icon={faFileContract} className="text-primary fa-lg" />
              </div>
              <div>
                <p className="text-sm font-bold tracking-tight text-foreground">Active Contract</p>
                <p className="text-xs text-muted-foreground">
                  {activeContract.contract_type?.replace('_', ' ').toUpperCase()}
                </p>
              </div>
            </div>
            <Badge
              className={
                STATUS_STYLES[activeContract.status].bg +
                ' ' +
                STATUS_STYLES[activeContract.status].text
              }
              variant="secondary"
            >
              {STATUS_STYLES[activeContract.status].label}
            </Badge>
          </div>

          <div className="space-y-2 text-sm mb-4">
            <p>
              <span className="text-muted-foreground">Effective from:</span>{' '}
              <span className="font-mono">{activeContract.effective_from}</span>
            </p>
            {activeContract.issued_at && (
              <p>
                <span className="text-muted-foreground">Issued:</span>{' '}
                <span className="font-mono">
                  {new Date(activeContract.issued_at).toLocaleDateString('en-PH')}
                </span>
              </p>
            )}
          </div>

          <Link href={`/contracts/${activeContract.id}`}>
            <Button size="sm" className="gap-2">
              <FontAwesomeIcon icon={faCheckCircle} className="fa-xs" />
              View Contract
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <FontAwesomeIcon icon={faFileContract} className="text-amber-600 fa-lg flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="font-bold text-amber-900">No Active Contract</p>
              <p className="text-sm text-amber-800 mt-1">
                Generate an employment contract for {employeeName}
              </p>
              {canGenerate && (
                <div className="mt-4">
                  <GenerateContractDialog employeeId={employeeId} employeeName={employeeName} />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contract History */}
      {contractHistory.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-bold text-foreground">Contract History</h4>
          {contractHistory.map((contract) => (
            <Card key={contract.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">
                    {contract.contract_type?.replace('_', ' ').toUpperCase()}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {contract.status === 'superseded' ? 'Superseded on' : 'Voided on'}{' '}
                    {contract.status === 'superseded'
                      ? new Date(contract.updated_at).toLocaleDateString('en-PH')
                      : contract.voided_at
                        ? new Date(contract.voided_at).toLocaleDateString('en-PH')
                        : '—'}
                  </p>
                  {contract.void_reason && (
                    <p className="text-xs text-red-600 mt-2 font-semibold">
                      Reason: {contract.void_reason}
                    </p>
                  )}
                </div>

                <Badge
                  className={
                    STATUS_STYLES[contract.status].bg + ' ' + STATUS_STYLES[contract.status].text
                  }
                  variant="secondary"
                >
                  {STATUS_STYLES[contract.status].label}
                </Badge>
              </div>

              {contract.storage_path && (
                <div className="mt-3">
                  <Button variant="outline" size="sm" className="gap-2">
                    <FontAwesomeIcon icon={faDownload} className="fa-xs" />
                    Download PDF
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
