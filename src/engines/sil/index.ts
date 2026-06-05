import type { SilInput, SilAccrualResult } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00`)
}

/** Full months of service between two dates (floor). */
function monthsOfService(hireDate: Date, asOfDate: Date): number {
  const yearDiff  = asOfDate.getFullYear() - hireDate.getFullYear()
  const monthDiff = asOfDate.getMonth()    - hireDate.getMonth()
  const dayDiff   = asOfDate.getDate()     - hireDate.getDate()

  let months = yearDiff * 12 + monthDiff
  // If we haven't reached the hire day-of-month yet in the current month, subtract 1
  if (dayDiff < 0) months -= 1
  return Math.max(0, months)
}

// ---------------------------------------------------------------------------
// Main engine
// ---------------------------------------------------------------------------

/**
 * LV-006 — SIL Accrual Engine
 *
 * Pure function: same inputs → same outputs. No DB, no side effects.
 *
 * Authority: Labor Code Art. 95 (PD 442).
 *   - Entitlement: 5 SIL days per year of service.
 *   - Eligibility: employee must have rendered at least 1 year of service.
 *   - Exemptions: managerial/field personnel, companies with < 10 workers (configured
 *     at the tenant level — handled by the caller; `isExempt` reflects the result).
 *
 * Balance rule: balance is ALWAYS derived from the ledger — never stored as a counter.
 *   balance = sum of all ledger entries (positive = credited, negative = debited)
 */
export function computeSilAccrual(input: SilInput): SilAccrualResult {
  const { hireDate: hireDateStr, asOfDate: asOfDateStr, ledgerEntries, isExempt } = input

  const hireDate  = parseDate(hireDateStr)
  const asOfDate  = parseDate(asOfDateStr)

  const months    = monthsOfService(hireDate, asOfDate)
  const isEligible = !isExempt && months >= 12

  // Balance is derived from the ledger — sum all entries
  let earnedDays  = 0
  let usedDays    = 0
  let balanceDays = 0

  for (const entry of ledgerEntries) {
    // Only count entries on or before asOfDate
    if (parseDate(entry.date).getTime() > asOfDate.getTime()) continue

    balanceDays += entry.days

    if (entry.entryType === 'accrual' || entry.entryType === 'carryover') {
      earnedDays += entry.days
    } else if (entry.entryType === 'usage' || entry.entryType === 'cash_out' || entry.entryType === 'forfeit') {
      usedDays += Math.abs(entry.days)
    }
    // 'adjustment' affects balance directly but not earnedDays / usedDays buckets
  }

  return {
    isEligible,
    monthsOfService: months,
    earnedDays:    Math.round(earnedDays * 10) / 10,   // 1 decimal
    usedDays:      Math.round(usedDays   * 10) / 10,
    balanceDays:   Math.round(balanceDays * 10) / 10,
  }
}

// ---------------------------------------------------------------------------
// Accrual schedule helper (used by the nightly background job, not the engine itself)
// ---------------------------------------------------------------------------

/**
 * Returns the number of SIL days to accrue for a given month of service.
 * Monthly pro-rate: 5 days / 12 months ≈ 0.4167 days/month.
 * The background job calls this and creates a ledger entry; it does not mutate state.
 */
export function monthlySilAccrual(): number {
  return Math.round((5 / 12) * 10) / 10 // 0.4 days (1 decimal)
}
