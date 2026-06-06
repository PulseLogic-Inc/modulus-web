'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileContract, faCheck, faArrowLeft, faDownload, faTrash } from '@fortawesome/free-solid-svg-icons'
import type { Database } from '@/types/supabase'

type EmploymentContract = Database['public']['Tables']['employment_contracts']['Row']

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
  issued: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Issued' },
  signed: { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Signed' },
  superseded: { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Superseded' },
  voided: { bg: 'bg-red-100', text: 'text-red-800', label: 'Voided' },
}

interface ContractViewerProps {
  contract: EmploymentContract
  employeeName: string
  onIssue?: () => void
  onVoid?: () => void
  issuePending?: boolean
  voidPending?: boolean
}

export function ContractViewer({
  contract,
  employeeName,
  onIssue,
  onVoid,
  issuePending,
  voidPending,
}: ContractViewerProps) {
  const [showVoidDialog, setShowVoidDialog] = useState(false)
  const status = STATUS_COLORS[contract.status] || STATUS_COLORS.draft

  const canIssue = contract.status === 'draft'
  const canVoid = ['draft', 'issued', 'signed'].includes(contract.status)

  return (
    <div className="space-y-6">
      <Link href="/contracts">
        <Button variant="outline" size="sm" className="gap-2">
          <FontAwesomeIcon icon={faArrowLeft} className="fa-xs" />
          Back to Contracts
        </Button>
      </Link>

      <Card className="rounded-xl border bg-card p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <FontAwesomeIcon icon={faFileContract} className="text-primary fa-lg" />
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {contract.contract_type?.replace('_', ' ').toUpperCase()} Contract
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">For: {employeeName}</p>
          </div>

          <Badge className={status.bg + ' ' + status.text} variant="secondary">
            {status.label}
          </Badge>
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-muted/50">
          <div>
            <p className="text-xs text-muted-foreground">Effective From</p>
            <p className="text-sm font-mono font-bold">{contract.effective_from}</p>
          </div>
          {contract.effective_to && (
            <div>
              <p className="text-xs text-muted-foreground">Effective To</p>
              <p className="text-sm font-mono font-bold">{contract.effective_to}</p>
            </div>
          )}
          {contract.issued_at && (
            <div>
              <p className="text-xs text-muted-foreground">Issued</p>
              <p className="text-sm font-mono font-bold">
                {new Date(contract.issued_at).toLocaleDateString('en-PH')}
              </p>
            </div>
          )}
          {contract.voided_at && (
            <div>
              <p className="text-xs text-muted-foreground">Voided</p>
              <p className="text-sm font-mono font-bold">
                {new Date(contract.voided_at).toLocaleDateString('en-PH')}
              </p>
            </div>
          )}
        </div>

        {/* PDF Viewer Placeholder */}
        {contract.storage_path ? (
          <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
            <FontAwesomeIcon icon={faFileContract} className="fa-4x text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">PDF available for download</p>
            <Button variant="outline" size="sm" className="mt-4 gap-2">
              <FontAwesomeIcon icon={faDownload} className="fa-xs" />
              Download PDF
            </Button>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed bg-muted/50 p-12 text-center">
            <p className="text-sm text-muted-foreground">
              {contract.status === 'draft' ? 'PDF will be generated when issued' : 'No PDF on file'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {canIssue && (
            <Button
              onClick={onIssue}
              disabled={issuePending}
              className="gap-2 flex-1"
            >
              <FontAwesomeIcon icon={faCheck} className="fa-xs" />
              {issuePending ? 'Issuing...' : 'Issue & Generate PDF'}
            </Button>
          )}

          {canVoid && (
            <Button
              onClick={() => setShowVoidDialog(true)}
              variant="destructive"
              disabled={voidPending}
              className="gap-2"
            >
              <FontAwesomeIcon icon={faTrash} className="fa-xs" />
              {voidPending ? 'Voiding...' : 'Void'}
            </Button>
          )}
        </div>

        {/* Void reason */}
        {contract.void_reason && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-xs text-red-800 font-semibold mb-1">Void Reason:</p>
            <p className="text-sm text-red-700">{contract.void_reason}</p>
          </div>
        )}
      </Card>

      {/* Contract Details */}
      <Card className="rounded-xl border bg-card p-6">
        <h3 className="text-lg font-bold tracking-tight text-foreground mb-4">Details</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-muted-foreground">Type:</span>{' '}
            <span className="font-semibold">{contract.contract_type?.replace('_', ' ')}</span>
          </p>
          <p>
            <span className="text-muted-foreground">Status:</span>{' '}
            <Badge className={status.bg + ' ' + status.text} variant="secondary">
              {status.label}
            </Badge>
          </p>
          <p>
            <span className="text-muted-foreground">Created:</span>{' '}
            <span className="font-mono">{new Date(contract.created_at).toLocaleDateString('en-PH')}</span>
          </p>
          {contract.issued_by && (
            <p>
              <span className="text-muted-foreground">Issued by:</span>{' '}
              <span className="font-mono">{contract.issued_by}</span>
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
