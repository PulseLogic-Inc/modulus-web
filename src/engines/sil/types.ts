export type SilEntryType = 'accrual' | 'usage' | 'carryover' | 'forfeit' | 'adjustment' | 'cash_out'

export interface SilLedgerEntry {
  entryType:   SilEntryType
  days:        number  // positive = credited, negative = debited
  date:        string  // 'YYYY-MM-DD'
  referenceId?: string
  notes?:       string
}

export interface SilInput {
  hireDate:      string   // 'YYYY-MM-DD'
  asOfDate:      string   // 'YYYY-MM-DD' — compute balance as of this date
  ledgerEntries: SilLedgerEntry[]
  isExempt:      boolean  // true for managerial/field personnel (Labor Code exemption)
}

export interface SilAccrualResult {
  isEligible:    boolean  // requires >= 1 year of service per Labor Code Art. 95
  monthsOfService: number
  earnedDays:    number   // total accruals to date
  usedDays:      number   // total usage (absolute value)
  balanceDays:   number   // earnedDays − usedDays + carryover adjustments
}
