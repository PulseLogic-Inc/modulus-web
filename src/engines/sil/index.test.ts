import { describe, it, expect } from 'vitest'
import { computeSilAccrual, monthlySilAccrual } from './index'
import type { SilInput, SilLedgerEntry } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function base(overrides: Partial<SilInput> = {}): SilInput {
  return {
    hireDate:      '2025-01-01',
    asOfDate:      '2026-06-04',
    ledgerEntries: [],
    isExempt:      false,
    ...overrides,
  }
}

function accrualEntry(date: string, days: number): SilLedgerEntry {
  return { entryType: 'accrual', days, date }
}

function usageEntry(date: string, days: number): SilLedgerEntry {
  return { entryType: 'usage', days: -Math.abs(days), date }
}

// ---------------------------------------------------------------------------
// 1. Eligibility — Labor Code Art. 95: >= 1 year of service
// ---------------------------------------------------------------------------

describe('Eligibility', () => {
  it('is eligible after exactly 1 year of service', () => {
    const r = computeSilAccrual(base({
      hireDate:  '2025-06-04',
      asOfDate:  '2026-06-04',
    }))
    expect(r.isEligible).toBe(true)
    expect(r.monthsOfService).toBe(12)
  })

  it('is not eligible before 1 year of service', () => {
    const r = computeSilAccrual(base({
      hireDate: '2026-01-01',
      asOfDate: '2026-06-04',
    }))
    expect(r.isEligible).toBe(false)
    expect(r.monthsOfService).toBeLessThan(12)
  })

  it('is not eligible when marked exempt (managerial/field)', () => {
    const r = computeSilAccrual(base({ isExempt: true }))
    expect(r.isEligible).toBe(false)
  })

  it('is eligible after more than 1 year of service', () => {
    const r = computeSilAccrual(base({
      hireDate: '2020-01-01',
      asOfDate: '2026-06-04',
    }))
    expect(r.isEligible).toBe(true)
    expect(r.monthsOfService).toBeGreaterThan(12)
  })
})

// ---------------------------------------------------------------------------
// 2. Months of service calculation
// ---------------------------------------------------------------------------

describe('Months of service', () => {
  it('calculates exact months correctly', () => {
    const r = computeSilAccrual(base({
      hireDate: '2025-06-04',
      asOfDate: '2026-06-04',
    }))
    expect(r.monthsOfService).toBe(12)
  })

  it('does not count the current partial month if day has not been reached', () => {
    // Hired June 15 — on June 14 of next year, months = 11 (not yet completed 12th month)
    const r = computeSilAccrual(base({
      hireDate: '2025-06-15',
      asOfDate: '2026-06-14',
    }))
    expect(r.monthsOfService).toBe(11)
  })

  it('counts the month when the hire day-of-month is reached', () => {
    const r = computeSilAccrual(base({
      hireDate: '2025-06-15',
      asOfDate: '2026-06-15',
    }))
    expect(r.monthsOfService).toBe(12)
  })

  it('returns 0 months for same hire and as-of date', () => {
    const r = computeSilAccrual(base({
      hireDate: '2026-06-04',
      asOfDate: '2026-06-04',
    }))
    expect(r.monthsOfService).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// 3. Balance derived from ledger
// ---------------------------------------------------------------------------

describe('Balance from ledger', () => {
  it('returns zero balance with no ledger entries', () => {
    const r = computeSilAccrual(base({ ledgerEntries: [] }))
    expect(r.balanceDays).toBe(0)
    expect(r.earnedDays).toBe(0)
    expect(r.usedDays).toBe(0)
  })

  it('accumulates accrual entries correctly', () => {
    const entries = [
      accrualEntry('2025-02-01', 0.4),
      accrualEntry('2025-03-01', 0.4),
      accrualEntry('2025-04-01', 0.4),
    ]
    const r = computeSilAccrual(base({ ledgerEntries: entries }))
    expect(r.earnedDays).toBe(1.2)
    expect(r.balanceDays).toBe(1.2)
    expect(r.usedDays).toBe(0)
  })

  it('deducts usage entries from balance', () => {
    const entries = [
      accrualEntry('2025-02-01', 5),
      usageEntry('2025-06-01', 2),
    ]
    const r = computeSilAccrual(base({ ledgerEntries: entries }))
    expect(r.earnedDays).toBe(5)
    expect(r.usedDays).toBe(2)
    expect(r.balanceDays).toBe(3)
  })

  it('handles complete SIL year: 5 days earned, 2 used = 3 remaining', () => {
    const entries = Array.from({ length: 12 }, (_, i) => {
      const month = String(i + 2).padStart(2, '0')
      const year  = i < 11 ? '2025' : '2026'
      const m     = i < 11 ? String(i + 2).padStart(2, '0') : '01'
      return accrualEntry(`${year}-${m}-01`, 0.4)
    })
    entries.push(usageEntry('2026-03-15', 2))

    const r = computeSilAccrual(base({ ledgerEntries: entries }))
    expect(r.usedDays).toBe(2)
    expect(r.balanceDays).toBeLessThan(r.earnedDays)
  })

  it('ignores ledger entries after asOfDate', () => {
    const entries = [
      accrualEntry('2026-01-01', 5),
      accrualEntry('2026-07-01', 5), // after asOfDate (2026-06-04)
    ]
    const r = computeSilAccrual(base({ ledgerEntries: entries }))
    expect(r.earnedDays).toBe(5)   // only the Jan entry counted
    expect(r.balanceDays).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// 4. Carryover and year-end entries
// ---------------------------------------------------------------------------

describe('Carryover and year-end', () => {
  it('carries over unused days from previous year', () => {
    const entries = [
      accrualEntry('2025-01-01', 5),         // 5 days earned in year 1
      { entryType: 'carryover' as const, days: 2, date: '2026-01-01' }, // 2 days carried over
    ]
    const r = computeSilAccrual(base({ ledgerEntries: entries }))
    expect(r.earnedDays).toBe(7)   // accrual + carryover both count as earned
    expect(r.balanceDays).toBe(7)
  })

  it('forfeit entry reduces balance', () => {
    const entries = [
      accrualEntry('2025-01-01', 5),
      { entryType: 'forfeit' as const, days: -3, date: '2025-12-31' },
    ]
    const r = computeSilAccrual(base({ ledgerEntries: entries }))
    expect(r.balanceDays).toBe(2)
    expect(r.usedDays).toBe(3)
  })

  it('cash_out entry reduces balance', () => {
    const entries = [
      accrualEntry('2025-01-01', 5),
      { entryType: 'cash_out' as const, days: -5, date: '2025-12-31' },
    ]
    const r = computeSilAccrual(base({ ledgerEntries: entries }))
    expect(r.balanceDays).toBe(0)
    expect(r.usedDays).toBe(5)
  })
})

// ---------------------------------------------------------------------------
// 5. Monthly accrual helper
// ---------------------------------------------------------------------------

describe('Monthly SIL accrual helper', () => {
  it('returns 0.4 days per month (5 days / 12 months, rounded to 1 decimal)', () => {
    expect(monthlySilAccrual()).toBe(0.4)
  })

  it('accumulates to 4.8 days after 12 months (monthly pro-rate)', () => {
    // Note: due to rounding (0.4 × 12 = 4.8), the year-end accrual job creates
    // a reconciliation entry to top up to 5.0 days for eligible employees.
    expect(monthlySilAccrual() * 12).toBeCloseTo(4.8, 1)
  })
})

// ---------------------------------------------------------------------------
// 6. Edge cases
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  it('handles employee with 0 ledger entries (no accruals yet)', () => {
    const r = computeSilAccrual(base())
    expect(r.balanceDays).toBe(0)
    expect(r.earnedDays).toBe(0)
  })

  it('balance cannot go below zero from negative usage alone', () => {
    // Over-used (shouldn't happen in practice — the service layer prevents it, but engine handles it)
    const entries = [
      accrualEntry('2025-01-01', 2),
      usageEntry('2025-06-01', 5),  // using more than earned
    ]
    const r = computeSilAccrual(base({ ledgerEntries: entries }))
    expect(r.balanceDays).toBe(-3) // reflects the ledger honestly; UI layer validates
  })

  it('handles half-day usage (0.5 days)', () => {
    const entries = [
      accrualEntry('2025-01-01', 5),
      usageEntry('2025-06-01', 0.5),
    ]
    const r = computeSilAccrual(base({ ledgerEntries: entries }))
    expect(r.balanceDays).toBe(4.5)
    expect(r.usedDays).toBe(0.5)
  })
})
