import type { WorkedHoursResult } from '@/engines/worked-hours/types'

// ---------------------------------------------------------------------------
// Statutory table row types
// ---------------------------------------------------------------------------

export interface SssBracket {
  minSalary:     number  // PHP
  maxSalary:     number  // PHP
  employeeShare: number  // PHP/month
  employerShare: number  // PHP/month
}

export interface PhilhealthTable {
  rate:       number  // e.g. 0.05 (5%)
  minSalary:  number  // PHP — floor for premium calculation
  maxSalary:  number  // PHP — MSC cap (₱100,000 in 2026)
  minPremium: number  // PHP — minimum monthly premium per member
  maxPremium: number  // PHP — maximum monthly premium per member
}

export interface PagibigTable {
  employeeRate: number  // e.g. 0.02 (2%)
  employerRate: number  // e.g. 0.02 (2%)
}

export interface BirBracket {
  bracketFrom: number        // PHP — lower bound of taxable income bracket
  bracketTo:   number | null // PHP — upper bound (null = no cap)
  baseTax:     number        // PHP — fixed tax at lower bound
  rate:         number        // e.g. 0.25 (25%) — marginal rate above bracketFrom
}

export interface StatutoryTables {
  sss:        SssBracket[]
  philhealth: PhilhealthTable
  pagibig:    PagibigTable
  birBracket: BirBracket   // the specific bracket applicable to this employee's taxable income
}

// ---------------------------------------------------------------------------
// Worked day summary — derived from Worked Hours Engine per day
// ---------------------------------------------------------------------------

export interface WorkedDaySummary extends WorkedHoursResult {
  date:        string   // 'YYYY-MM-DD'
  isRestDay:   boolean
  holidayType: 'regular_holiday' | 'special_non_working' | 'special_working' | null
}

// ---------------------------------------------------------------------------
// Leave day (approved leave that attracts leave pay in this period)
// ---------------------------------------------------------------------------

export interface LeaveDaySummary {
  date:      string
  leaveType: 'sil' | 'vl' | 'sl' | 'ml' | 'pl'
  days:      number   // 1.0 or 0.5
  isPaid:    boolean  // ML flags as paid (SSS-reimbursable) — payroll engine just computes
}

// ---------------------------------------------------------------------------
// Payroll engine input / output
// ---------------------------------------------------------------------------

export interface PayrollInput {
  employeeId:       string
  tenantId:         string
  compensationType: 'daily' | 'monthly'
  rateCentavos:     number     // daily rate OR monthly rate, in centavos
  periodCadence:    'weekly' | 'semi_monthly' | 'bi_weekly' | 'monthly'
  workedDays:       WorkedDaySummary[]
  leaveDays:        LeaveDaySummary[]
  statutoryTables:  StatutoryTables
}

export interface PayrollLineItem {
  type:             string   // reason code (e.g. 'OT_REGULAR_125', 'SSS_EE')
  description:      string
  amountCentavos:   number
  isDeduction:      boolean
}

export interface PayrollResult {
  // Earnings
  grossPayCentavos:        number
  leavePayCentavos:        number
  // Employee deductions
  sssEeCentavos:           number
  philhealthEeCentavos:    number
  pagibigEeCentavos:       number
  whtCentavos:             number
  totalDeductionsCentavos: number
  // Employer cost
  sssErCentavos:           number
  philhealthErCentavos:    number
  pagibigErCentavos:       number
  // Net
  netPayCentavos:          number
  // Full itemised breakdown for audit replay
  lineItems:               PayrollLineItem[]
}
