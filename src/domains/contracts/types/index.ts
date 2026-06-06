import { z } from 'zod'

// ---------------------------------------------------------------------------
// Domain enums
// ---------------------------------------------------------------------------

export type ContractType =
  | 'probationary'
  | 'regular'
  | 'project_based'
  | 'casual'
  | 'fixed_term'
  | 'contractual'

export type ContractStatus =
  | 'draft'
  | 'issued'
  | 'signed'
  | 'superseded'
  | 'voided'

// ---------------------------------------------------------------------------
// Zod schemas — used in both form validation (client) and server actions
// ---------------------------------------------------------------------------

export const GenerateContractSchema = z.object({
  employee_id: z.string().uuid('Employee ID is required'),
  contract_type: z.enum([
    'probationary',
    'regular',
    'project_based',
    'casual',
    'fixed_term',
    'contractual',
  ]),
})
export type GenerateContractInput = z.infer<typeof GenerateContractSchema>

export const IssueContractSchema = z.object({
  contract_id: z.string().uuid('Contract ID is required'),
})
export type IssueContractInput = z.infer<typeof IssueContractSchema>

export const VoidContractSchema = z.object({
  contract_id: z.string().uuid('Contract ID is required'),
  reason: z.string().min(10, 'Reason must be at least 10 characters').max(255),
})
export type VoidContractInput = z.infer<typeof VoidContractSchema>
