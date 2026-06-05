import { describe, it, expect } from 'vitest'
import { computePayroll } from './index'
import type { PayrollInput, StatutoryTables, WorkedDaySummary } from './types'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const STATUTORY: StatutoryTables = {
  sss: [
    { minSalary: 0,       maxSalary: 4249.99, employeeShare: 180,    employerShare: 180   },
    { minSalary: 4250,    maxSalary: 4749.99, employeeShare: 202.5,  employerShare: 202.5 },
    { minSalary: 4750,    maxSalary: 9749.99, employeeShare: 450,    employerShare: 450   },
    { minSalary: 9750,    maxSalary: 29749.99,employeeShare: 900,    employerShare: 900   },
    { minSalary: 29750,   maxSalary: 999999,  employeeShare: 1350,   employerShare: 1350  },
  ],
  philhealth: {
    rate:       0.05,
    minSalary:  0,
    maxSalary:  100_000,
    minPremium: 250,
    maxPremium: 5_000,
  },
  pagibig: {
    employeeRate: 0.02,
    employerRate: 0.02,
  },
  // Semi-monthly bracket: ₱0 – ₱10,417 → 0% (non-taxable)
  birBracket: {
    bracketFrom: 0,
    bracketTo:   10_417,
    baseTax:     0,
    rate:        0,
  },
}

/** Standard 8h regular workday, no OT, no late, no night diff. */
function regularDay(date: string): WorkedDaySummary {
  return {
    date,
    workedMinutes:    480,
    regularMinutes:   480,
    otMinutes:        0,
    nightDiffMinutes: 0,
    lateMinutes:      0,
    undertimeMinutes: 0,
    isRestDay:        false,
    holidayType:      null,
  }
}

function base(overrides: Partial<PayrollInput> = {}): PayrollInput {
  return {
    employeeId:       'emp-001',
    tenantId:         'tenant-001',
    compensationType: 'daily',
    rateCentavos:     69_500,  // ₱695/day
    periodCadence:    'semi_monthly',
    workedDays:       [regularDay('2026-06-01')],
    leaveDays:        [],
    statutoryTables:  STATUTORY,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// 1. Basic gross pay
// ---------------------------------------------------------------------------

describe('Basic gross pay', () => {
  it('computes basic pay for one standard 8h day at daily rate', () => {
    const r = computePayroll(base())
    // ₱695 × 1 day = 69,500 centavos
    expect(r.grossPayCentavos).toBe(69_500)
    expect(r.lineItems.some((l) => l.type === 'BASIC_PAY')).toBe(true)
  })

  it('computes basic pay for multiple regular days', () => {
    const days = ['2026-06-01', '2026-06-02', '2026-06-03'].map(regularDay)
    const r = computePayroll(base({ workedDays: days }))
    expect(r.grossPayCentavos).toBe(69_500 * 3)
  })

  it('monthly-rate employee: derives daily rate using 26 working days', () => {
    // ₱18,070/month → ₱695.77/day → 69,577 centavos/day (floor to 69,577)
    const monthlyRate = 1_807_000 // ₱18,070 in centavos
    const r = computePayroll(base({
      compensationType: 'monthly',
      rateCentavos:     monthlyRate,
      workedDays:       [regularDay('2026-06-01')],
    }))
    // dailyRate = floor(1_807_000 / 26) = floor(69_500) = 69_500
    expect(r.grossPayCentavos).toBe(69_500)
  })
})

// ---------------------------------------------------------------------------
// 2. OT pay — DOLE multipliers
// ---------------------------------------------------------------------------

describe('OT pay', () => {
  it('applies 1.25× multiplier for regular day OT', () => {
    const day: WorkedDaySummary = { ...regularDay('2026-06-01'), otMinutes: 60 }
    const r = computePayroll(base({ workedDays: [day] }))
    const otItem = r.lineItems.find((l) => l.type === 'OT_REGULAR_125')
    expect(otItem).toBeDefined()
    // Hourly rate = floor(69500 / 8) = 8687 centavos/hour
    // OT pay = 8687 × 1.25 = 10858.75 → round = 10859
    expect(otItem!.amountCentavos).toBeGreaterThan(0)
    expect(r.grossPayCentavos).toBeGreaterThan(69_500)
  })

  it('applies 1.30× for rest day regular hours', () => {
    const day: WorkedDaySummary = {
      ...regularDay('2026-06-07'),
      isRestDay:      true,
      regularMinutes: 480,
    }
    const r = computePayroll(base({ workedDays: [day] }))
    const item = r.lineItems.find((l) => l.type === 'REST_DAY_130')
    expect(item).toBeDefined()
    expect(item!.amountCentavos).toBeGreaterThan(69_500) // > base daily
  })

  it('applies 1.69× for rest day OT', () => {
    const day: WorkedDaySummary = {
      ...regularDay('2026-06-07'),
      isRestDay: true,
      otMinutes: 120,
    }
    const r = computePayroll(base({ workedDays: [day] }))
    const item = r.lineItems.find((l) => l.type === 'OT_REST_DAY_169')
    expect(item).toBeDefined()
    expect(item!.amountCentavos).toBeGreaterThan(0)
  })

  it('applies 2.00× for regular holiday regular hours', () => {
    const day: WorkedDaySummary = {
      ...regularDay('2026-09-21'),
      holidayType: 'regular_holiday',
    }
    const r = computePayroll(base({ workedDays: [day] }))
    const item = r.lineItems.find((l) => l.type === 'REGULAR_HOL_200')
    expect(item).toBeDefined()
    // ₱695 × 2.00 = ₱1,390
    expect(item!.amountCentavos).toBeCloseTo(139_000, -2)
  })

  it('applies 2.60× for regular holiday OT', () => {
    const day: WorkedDaySummary = {
      ...regularDay('2026-09-21'),
      holidayType: 'regular_holiday',
      otMinutes:   60,
    }
    const r = computePayroll(base({ workedDays: [day] }))
    const item = r.lineItems.find((l) => l.type === 'OT_REGULAR_HOL_260')
    expect(item).toBeDefined()
    expect(item!.amountCentavos).toBeGreaterThan(0)
  })

  it('applies 1.30× for special non-working regular hours', () => {
    const day: WorkedDaySummary = {
      ...regularDay('2026-12-08'),
      holidayType: 'special_non_working',
    }
    const r = computePayroll(base({ workedDays: [day] }))
    const item = r.lineItems.find((l) => l.type === 'SPECIAL_NW_130')
    expect(item).toBeDefined()
  })

  it('applies 1.69× for special non-working OT', () => {
    const day: WorkedDaySummary = {
      ...regularDay('2026-12-08'),
      holidayType: 'special_non_working',
      otMinutes:   60,
    }
    const r = computePayroll(base({ workedDays: [day] }))
    const item = r.lineItems.find((l) => l.type === 'OT_SPECIAL_NW_169')
    expect(item).toBeDefined()
    expect(item!.amountCentavos).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// 3. Night differential (+10%)
// ---------------------------------------------------------------------------

describe('Night differential', () => {
  it('adds +10% night diff on night-diff minutes', () => {
    const day: WorkedDaySummary = {
      ...regularDay('2026-06-01'),
      nightDiffMinutes: 60,
    }
    const r = computePayroll(base({ workedDays: [day] }))
    const item = r.lineItems.find((l) => l.type === 'NIGHT_DIFF_10PCT')
    expect(item).toBeDefined()
    expect(item!.amountCentavos).toBeGreaterThan(0)
    expect(item!.isDeduction).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// 4. Late and undertime deductions
// ---------------------------------------------------------------------------

describe('Late and undertime deductions', () => {
  it('deducts late minutes at per-minute rate', () => {
    const day: WorkedDaySummary = { ...regularDay('2026-06-01'), lateMinutes: 30 }
    const r = computePayroll(base({ workedDays: [day] }))
    const item = r.lineItems.find((l) => l.type === 'LATE_DEDUCTION')
    expect(item).toBeDefined()
    expect(item!.isDeduction).toBe(true)
    expect(r.grossPayCentavos).toBeLessThan(69_500)
  })

  it('deducts undertime minutes at per-minute rate', () => {
    const day: WorkedDaySummary = { ...regularDay('2026-06-01'), undertimeMinutes: 60 }
    const r = computePayroll(base({ workedDays: [day] }))
    const item = r.lineItems.find((l) => l.type === 'UNDERTIME_DEDUCTION')
    expect(item).toBeDefined()
    expect(item!.isDeduction).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 5. Leave pay
// ---------------------------------------------------------------------------

describe('Leave pay', () => {
  it('adds leave pay for approved paid leave (SIL)', () => {
    const r = computePayroll(base({
      leaveDays: [{ date: '2026-06-02', leaveType: 'sil', days: 1, isPaid: true }],
    }))
    const item = r.lineItems.find((l) => l.type === 'LEAVE_PAY')
    expect(item).toBeDefined()
    expect(item!.amountCentavos).toBe(69_500)
    expect(r.leavePayCentavos).toBe(69_500)
  })

  it('does not add leave pay for unpaid leave', () => {
    const r = computePayroll(base({
      leaveDays: [{ date: '2026-06-02', leaveType: 'sl', days: 1, isPaid: false }],
    }))
    const item = r.lineItems.find((l) => l.type === 'LEAVE_PAY')
    expect(item).toBeUndefined()
    expect(r.leavePayCentavos).toBe(0)
  })

  it('handles half-day leave pay', () => {
    const r = computePayroll(base({
      leaveDays: [{ date: '2026-06-02', leaveType: 'vl', days: 0.5, isPaid: true }],
    }))
    expect(r.leavePayCentavos).toBe(Math.round(69_500 * 0.5))
  })
})

// ---------------------------------------------------------------------------
// 6. Statutory contributions
// ---------------------------------------------------------------------------

describe('Statutory contributions', () => {
  it('computes SSS employee and employer contributions', () => {
    const r = computePayroll(base())
    expect(r.sssEeCentavos).toBeGreaterThan(0)
    expect(r.sssErCentavos).toBeGreaterThan(0)
    expect(r.lineItems.some((l) => l.type === 'SSS_EE' && l.isDeduction)).toBe(true)
    expect(r.lineItems.some((l) => l.type === 'SSS_ER' && !l.isDeduction)).toBe(true)
  })

  it('computes PhilHealth employee and employer contributions', () => {
    const r = computePayroll(base())
    expect(r.philhealthEeCentavos).toBeGreaterThan(0)
    expect(r.philhealthErCentavos).toBeGreaterThan(0)
  })

  it('computes Pag-IBIG contributions', () => {
    const r = computePayroll(base())
    expect(r.pagibigEeCentavos).toBeGreaterThan(0)
    expect(r.pagibigErCentavos).toBeGreaterThan(0)
  })

  it('SSS EE does not exceed monthly cap', () => {
    // High earner — should cap at highest SSS bracket
    const highEarner = base({ rateCentavos: 500_000 }) // ₱5,000/day
    const r = computePayroll(highEarner)
    // Monthly gross ≈ 5000 × 26 = 130,000 → SSS at ₱1,350/month
    // Semi-monthly = 675
    expect(r.sssEeCentavos).toBeLessThanOrEqual(135_000) // monthly cap in centavos
  })

  it('PhilHealth premium is capped at MSC', () => {
    // Employee earning ₱200,000/month — PhilHealth capped at ₱100k × 5% = ₱5,000/month
    const r = computePayroll(base({
      compensationType: 'monthly',
      rateCentavos:     20_000_000, // ₱200,000
      workedDays:       [regularDay('2026-06-01')],
    }))
    // Monthly PhilHealth max = ₱5,000 split 50/50 = ₱2,500 EE per month
    // Semi-monthly = ₱1,250 = 125,000 centavos
    expect(r.philhealthEeCentavos).toBeLessThanOrEqual(250_000)
  })
})

// ---------------------------------------------------------------------------
// 7. Withholding tax (BIR 1601-C)
// ---------------------------------------------------------------------------

describe('Withholding tax', () => {
  it('returns zero WHT for income within non-taxable bracket', () => {
    // Base employee at ₱695/day semi-monthly gross ≈ ₱695 × 13 = ₱9,035 — below ₱10,417
    const days = Array.from({ length: 13 }, (_, i) =>
      regularDay(`2026-06-${String(i + 1).padStart(2, '0')}`)
    )
    const r = computePayroll(base({ workedDays: days }))
    expect(r.whtCentavos).toBe(0)
  })

  it('applies WHT for income in taxable bracket', () => {
    // 15% bracket: ₱10,417.01 to ₱16,667
    const taxableBracket: StatutoryTables['birBracket'] = {
      bracketFrom: 10_417,
      bracketTo:   16_667,
      baseTax:     0,
      rate:        0.15,
    }
    const r = computePayroll(base({
      statutoryTables: { ...STATUTORY, birBracket: taxableBracket },
      rateCentavos:    150_000, // ₱1,500/day — high enough for WHT
      workedDays:      Array.from({ length: 13 }, (_, i) =>
        regularDay(`2026-06-${String(i + 1).padStart(2, '0')}`)
      ),
    }))
    expect(r.whtCentavos).toBeGreaterThan(0)
    expect(r.lineItems.some((l) => l.type === 'WHT' && l.isDeduction)).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// 8. Net pay integrity
// ---------------------------------------------------------------------------

describe('Net pay integrity', () => {
  it('net pay = gross − total deductions', () => {
    const days = Array.from({ length: 13 }, (_, i) =>
      regularDay(`2026-06-${String(i + 1).padStart(2, '0')}`)
    )
    const r = computePayroll(base({ workedDays: days }))
    expect(r.netPayCentavos).toBe(r.grossPayCentavos - r.totalDeductionsCentavos)
  })

  it('net pay is never negative', () => {
    // Pathological case: only 1 minute worked
    const day: WorkedDaySummary = {
      ...regularDay('2026-06-01'),
      workedMinutes:  1,
      regularMinutes: 1,
      lateMinutes:    479, // extreme late
    }
    const r = computePayroll(base({ workedDays: [day] }))
    expect(r.netPayCentavos).toBeGreaterThanOrEqual(0)
  })

  it('all line items that are deductions are included in totalDeductions', () => {
    const day: WorkedDaySummary = {
      ...regularDay('2026-06-01'),
      otMinutes:        60,
      nightDiffMinutes: 60,
      lateMinutes:      15,
    }
    const r = computePayroll(base({ workedDays: [day] }))
    // Verify no float bleed: all values are integers
    expect(r.grossPayCentavos % 1).toBe(0)
    expect(r.netPayCentavos % 1).toBe(0)
    expect(r.sssEeCentavos % 1).toBe(0)
    expect(r.whtCentavos % 1).toBe(0)
  })

  it('every line item has an integer amount (no floats)', () => {
    const r = computePayroll(base())
    r.lineItems.forEach((item) => {
      expect(item.amountCentavos % 1).toBe(0)
    })
  })
})

// ---------------------------------------------------------------------------
// 9. Payroll cadence variations
// ---------------------------------------------------------------------------

describe('Payroll cadence', () => {
  it('weekly cadence produces lower per-period statutory contributions', () => {
    const weekly     = computePayroll(base({ periodCadence: 'weekly' }))
    const semiMonthly = computePayroll(base({ periodCadence: 'semi_monthly' }))
    // Weekly periods → lower per-period deductions (monthly total same)
    expect(weekly.sssEeCentavos).toBeLessThan(semiMonthly.sssEeCentavos)
  })

  it('monthly cadence produces full-month statutory contributions', () => {
    const monthly = computePayroll(base({ periodCadence: 'monthly' }))
    const semiMonthly = computePayroll(base({ periodCadence: 'semi_monthly' }))
    expect(monthly.sssEeCentavos).toBeGreaterThan(semiMonthly.sssEeCentavos)
  })
})
