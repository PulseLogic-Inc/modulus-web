export interface SilLedgerEntry {
  entryType: 'accrual' | 'usage' | 'carryover' | 'forfeit' | 'cash_out'
  days: number    // positive = credited, negative = debited
  date: Date
}

export interface SilInput {
  hireDate: Date
  asOfDate: Date
  ledgerEntries: SilLedgerEntry[]
  isExempt: boolean     // managerial/field personnel exempt from SIL (Labor Code)
}

export interface SilResult {
  earnedDays: number
  usedDays: number
  balanceDays: number
  isEligible: boolean   // requires >= 1 year of service per Labor Code Art. 95
}
