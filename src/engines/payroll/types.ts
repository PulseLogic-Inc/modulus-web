import type { WorkedHoursResult } from '@/engines/worked-hours/types'

export interface StatutoryTables {
  sss: { minSalary: number; maxSalary: number; employeeShare: number; employerShare: number }
  philhealth: { rate: number; minPremium: number; maxPremium: number }
  pagibig: { employeeRate: number; employerRate: number }
  birBracket: { bracketFrom: number; bracketTo: number | null; baseTax: number; rate: number }
}

export interface PayrollInput {
  employeeId: string
  tenantId: string
  rateCentavos: number          // daily or monthly rate in centavos
  compensationType: 'daily' | 'monthly'
  workedHours: WorkedHoursResult[]  // one per worked day in the period
  statutoryTables: StatutoryTables
  periodCadence: 'weekly' | 'semi_monthly' | 'bi_weekly' | 'monthly'
}

export interface PayrollLineItem {
  type: string          // reason code e.g. 'BASIC_PAY', 'OT_REGULAR_125', 'SSS_EE'
  description: string
  amountCentavos: number
  isDeduction: boolean
}

export interface PayrollResult {
  basicPayCentavos: number
  otPayCentavos: number
  nightDiffCentavos: number
  leavePayCentavos: number
  grossPayCentavos: number
  sssEeCentavos: number
  philhealthEeCentavos: number
  pagibigEeCentavos: number
  whtCentavos: number
  totalDeductionsCentavos: number
  sssErCentavos: number
  philhealthErCentavos: number
  pagibigErCentavos: number
  netPayCentavos: number
  lineItems: PayrollLineItem[]
}
