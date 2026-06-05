import type {
  PayrollInput,
  PayrollResult,
  PayrollLineItem,
  StatutoryTables,
  WorkedDaySummary,
} from './types'

// ---------------------------------------------------------------------------
// Reason codes — every line item must carry one for audit replay
// ---------------------------------------------------------------------------

const RC = {
  BASIC_PAY:              'BASIC_PAY',
  OT_REGULAR_125:         'OT_REGULAR_125',
  OT_REST_DAY_169:        'OT_REST_DAY_169',
  OT_SPECIAL_NW_169:      'OT_SPECIAL_NW_169',
  OT_REGULAR_HOL_260:     'OT_REGULAR_HOL_260',
  REST_DAY_130:           'REST_DAY_130',
  SPECIAL_NW_130:         'SPECIAL_NW_130',
  REGULAR_HOL_200:        'REGULAR_HOL_200',
  NIGHT_DIFF_10PCT:       'NIGHT_DIFF_10PCT',
  LEAVE_PAY:              'LEAVE_PAY',
  LATE_DEDUCTION:         'LATE_DEDUCTION',
  UNDERTIME_DEDUCTION:    'UNDERTIME_DEDUCTION',
  SSS_EE:                 'SSS_EE',
  PHILHEALTH_EE:          'PHILHEALTH_EE',
  PAGIBIG_EE:             'PAGIBIG_EE',
  WHT:                    'WHT',
  SSS_ER:                 'SSS_ER',
  PHILHEALTH_ER:          'PHILHEALTH_ER',
  PAGIBIG_ER:             'PAGIBIG_ER',
} as const

// ---------------------------------------------------------------------------
// Helpers — ALL arithmetic in integer centavos (no floats)
// ---------------------------------------------------------------------------

/** Floors a centavo value to nearest integer (no rounding up on deductions). */
function floor(n: number): number {
  return Math.floor(n)
}

function round(n: number): number {
  return Math.round(n)
}

/** Daily rate in centavos from a monthly rate. Uses 26 working days / month (DOLE standard). */
function dailyRateFromMonthly(monthlyCentavos: number): number {
  return floor(monthlyCentavos / 26)
}

/** Hourly rate in centavos from daily rate (8h standard workday). */
function hourlyRate(dailyCentavos: number): number {
  return floor(dailyCentavos / 8)
}

/** Per-minute rate in centavos. */
function minuteRate(dailyCentavos: number): number {
  return dailyCentavos / 8 / 60 // keep as float, round at the end
}

function line(
  type: string,
  description: string,
  amountCentavos: number,
  isDeduction: boolean,
): PayrollLineItem {
  return { type, description, amountCentavos: round(amountCentavos), isDeduction }
}

// ---------------------------------------------------------------------------
// Statutory contribution helpers
// ---------------------------------------------------------------------------

function calcSss(
  grossMonthlyCentavos: number,
  tables: StatutoryTables['sss'],
): { ee: number; er: number } {
  const grossMonthlyPHP = grossMonthlyCentavos / 100

  // Find the matching MSC bracket
  const bracket = tables.find(
    (t) => grossMonthlyPHP >= t.minSalary && grossMonthlyPHP <= t.maxSalary,
  ) ?? tables[tables.length - 1] // cap at highest bracket

  return {
    ee: round(bracket.employeeShare * 100),
    er: round(bracket.employerShare * 100),
  }
}

function calcPhilhealth(
  grossMonthlyCentavos: number,
  table: StatutoryTables['philhealth'],
): { ee: number; er: number } {
  const grossMonthlyPHP = grossMonthlyCentavos / 100
  const mssCap = table.maxSalary

  const basis     = Math.min(grossMonthlyPHP, mssCap)
  const totalPremium = Math.max(
    table.minPremium,
    Math.min(table.maxPremium, basis * table.rate),
  )
  const halfPremium = round((totalPremium / 2) * 100) // split 50/50

  return { ee: halfPremium, er: halfPremium }
}

function calcPagibig(
  grossMonthlyCentavos: number,
  table: StatutoryTables['pagibig'],
): { ee: number; er: number } {
  const grossMonthlyPHP = grossMonthlyCentavos / 100

  // Pag-IBIG: capped at ₱100 EE / ₱100 ER per month for regular employees
  // Higher voluntary contributions are possible but we compute mandatory here
  const EE_CAP = 100 * 100 // ₱100 in centavos
  const ER_CAP = 100 * 100

  const ee = Math.min(EE_CAP, round(grossMonthlyPHP * table.employeeRate * 100))
  const er = Math.min(ER_CAP, round(grossMonthlyPHP * table.employerRate * 100))

  return { ee, er }
}

/**
 * BIR 1601-C TRAIN Law — Withholding Tax on Compensation.
 * taxableCentavos = taxable compensation for the period.
 * Returns WHT in centavos for the period.
 */
function calcWht(
  taxableCentavos: number,
  bracket: StatutoryTables['birBracket'],
): number {
  const taxablePHP = taxableCentavos / 100
  const excess     = Math.max(0, taxablePHP - bracket.bracketFrom)
  const tax        = bracket.baseTax + excess * bracket.rate
  return round(Math.max(0, tax) * 100)
}

// ---------------------------------------------------------------------------
// Gross pay computation per worked day
// ---------------------------------------------------------------------------

function computeGrossForDay(
  day: WorkedDaySummary,
  dailyRateCentavos: number,
): { gross: number; items: PayrollLineItem[] } {
  const items: PayrollLineItem[] = []
  let gross = 0

  const hr   = hourlyRate(dailyRateCentavos)
  const perMin = minuteRate(dailyRateCentavos)

  // Basic pay (regular minutes at base rate)
  if (day.regularMinutes > 0) {
    if (day.isRestDay) {
      // Rest day: regular hours at 1.30×
      const amt = round(day.regularMinutes * perMin * 1.30)
      items.push(line(RC.REST_DAY_130, 'Rest day pay (1.30×)', amt, false))
      gross += amt
    } else if (day.holidayType === 'regular_holiday') {
      // Regular holiday: all hours at 2.00×
      const amt = round(day.regularMinutes * perMin * 2.00)
      items.push(line(RC.REGULAR_HOL_200, 'Regular holiday pay (2.00×)', amt, false))
      gross += amt
    } else if (day.holidayType === 'special_non_working') {
      // Special non-working: all hours at 1.30×
      const amt = round(day.regularMinutes * perMin * 1.30)
      items.push(line(RC.SPECIAL_NW_130, 'Special non-working pay (1.30×)', amt, false))
      gross += amt
    } else {
      // Regular day: basic pay at 1.00×
      const amt = round(day.regularMinutes * perMin)
      items.push(line(RC.BASIC_PAY, 'Basic pay', amt, false))
      gross += amt
    }
  }

  // OT pay
  if (day.otMinutes > 0) {
    let otRate: number
    let rcCode: string
    let desc: string

    if (day.isRestDay) {
      otRate = 1.69; rcCode = RC.OT_REST_DAY_169; desc = 'Rest day OT (1.69×)'
    } else if (day.holidayType === 'regular_holiday') {
      otRate = 2.60; rcCode = RC.OT_REGULAR_HOL_260; desc = 'Regular holiday OT (2.60×)'
    } else if (day.holidayType === 'special_non_working') {
      otRate = 1.69; rcCode = RC.OT_SPECIAL_NW_169; desc = 'Special non-working OT (1.69×)'
    } else {
      otRate = 1.25; rcCode = RC.OT_REGULAR_125; desc = 'Regular OT (1.25×)'
    }

    const amt = round(day.otMinutes * perMin * otRate)
    items.push(line(rcCode, desc, amt, false))
    gross += amt
  }

  // Night differential (+10% on all night-diff minutes)
  if (day.nightDiffMinutes > 0) {
    const amt = round(day.nightDiffMinutes * perMin * 0.10)
    items.push(line(RC.NIGHT_DIFF_10PCT, 'Night differential (+10%)', amt, false))
    gross += amt
  }

  // Late deduction (deducted at per-minute rate)
  if (day.lateMinutes > 0) {
    const amt = round(day.lateMinutes * perMin)
    items.push(line(RC.LATE_DEDUCTION, `Late deduction (${day.lateMinutes} min)`, amt, true))
    gross -= amt
  }

  // Undertime deduction
  if (day.undertimeMinutes > 0) {
    const amt = round(day.undertimeMinutes * perMin)
    items.push(line(RC.UNDERTIME_DEDUCTION, `Undertime deduction (${day.undertimeMinutes} min)`, amt, true))
    gross -= amt
  }

  return { gross: Math.max(0, gross), items }
}

// ---------------------------------------------------------------------------
// Main engine
// ---------------------------------------------------------------------------

/**
 * PAY-001 — Payroll Compute Engine
 *
 * Pure function: same inputs → same outputs. No DB, no side effects.
 * All monetary values in centavos (integer). Floating-point arithmetic forbidden
 * for final monetary results — intermediate calculations may use floats and are
 * rounded to the nearest centavo at output.
 *
 * Authority: Labor Code PD 442, DOLE DO 18-A, BIR RMC / TRAIN Law (RA 10963),
 * SSS, PhilHealth RA 11223, Pag-IBIG RA 9679.
 */
export function computePayroll(input: PayrollInput): PayrollResult {
  const { compensationType, rateCentavos, workedDays, leaveDays, statutoryTables, periodCadence } = input

  const lineItems: PayrollLineItem[] = []

  // --- Effective daily rate ---
  const dailyRateCentavos =
    compensationType === 'monthly'
      ? dailyRateFromMonthly(rateCentavos)
      : rateCentavos

  // --- Gross pay from timekeeping ---
  let earningsCentavos = 0

  for (const day of workedDays) {
    const { gross, items } = computeGrossForDay(day, dailyRateCentavos)
    earningsCentavos += gross
    lineItems.push(...items)
  }

  // --- Leave pay ---
  let leavePayCentavos = 0
  for (const leave of leaveDays) {
    if (leave.isPaid) {
      const amt = round(leave.days * dailyRateCentavos)
      leavePayCentavos += amt
      lineItems.push(line(RC.LEAVE_PAY, `Leave pay — ${leave.leaveType} (${leave.days}d)`, amt, false))
    }
  }
  earningsCentavos += leavePayCentavos

  const grossPayCentavos = Math.max(0, earningsCentavos)

  // --- Statutory contributions ---
  // Annualised monthly equivalent for SSS / PhilHealth / Pag-IBIG lookup
  // (contributions are always monthly regardless of payroll cadence)
  const periodsPerMonth: Record<typeof periodCadence, number> = {
    weekly:       4.33,
    bi_weekly:    2.17,
    semi_monthly: 2,
    monthly:      1,
  }
  const grossMonthlyCentavos = round(grossPayCentavos * periodsPerMonth[periodCadence])

  // SSS
  const sss = calcSss(grossMonthlyCentavos, statutoryTables.sss)
  // Split monthly SSS across cadence periods for deduction timing:
  // Semi-monthly: deduct in 2nd cutoff only (or split — configurable; we split evenly here)
  const sssEeForPeriod = round(sss.ee / periodsPerMonth[periodCadence])
  const sssErForPeriod = round(sss.er / periodsPerMonth[periodCadence])
  lineItems.push(line(RC.SSS_EE, 'SSS employee contribution', sssEeForPeriod, true))
  lineItems.push(line(RC.SSS_ER, 'SSS employer contribution', sssErForPeriod, false))

  // PhilHealth
  const ph = calcPhilhealth(grossMonthlyCentavos, statutoryTables.philhealth)
  const phEeForPeriod = round(ph.ee / periodsPerMonth[periodCadence])
  const phErForPeriod = round(ph.er / periodsPerMonth[periodCadence])
  lineItems.push(line(RC.PHILHEALTH_EE, 'PhilHealth employee contribution', phEeForPeriod, true))
  lineItems.push(line(RC.PHILHEALTH_ER, 'PhilHealth employer contribution', phErForPeriod, false))

  // Pag-IBIG (once per month — deducted in last period of month)
  // For simplicity, we pro-rate; the calling service decides which period to include it
  const pi = calcPagibig(grossMonthlyCentavos, statutoryTables.pagibig)
  lineItems.push(line(RC.PAGIBIG_EE, 'Pag-IBIG employee contribution', pi.ee, true))
  lineItems.push(line(RC.PAGIBIG_ER, 'Pag-IBIG employer contribution', pi.er, false))

  // BIR WHT (1601-C TRAIN Law)
  // Taxable income = gross − non-taxable exclusions (SSS/PhilHealth/Pag-IBIG are excluded)
  const totalEeContribCentavos = sssEeForPeriod + phEeForPeriod + pi.ee
  const taxableCentavos        = Math.max(0, grossPayCentavos - totalEeContribCentavos)
  const whtCentavos            = calcWht(taxableCentavos, statutoryTables.birBracket)
  lineItems.push(line(RC.WHT, 'Withholding tax (BIR 1601-C)', whtCentavos, true))

  // --- Totals ---
  const totalDeductionsCentavos = sssEeForPeriod + phEeForPeriod + pi.ee + whtCentavos
    + lineItems
      .filter((l) => l.isDeduction && ![RC.SSS_EE, RC.PHILHEALTH_EE, RC.PAGIBIG_EE, RC.WHT].includes(l.type))
      .reduce((s, l) => s + l.amountCentavos, 0)

  const netPayCentavos = Math.max(0, grossPayCentavos - totalDeductionsCentavos)

  return {
    grossPayCentavos,
    leavePayCentavos,
    sssEeCentavos:         sssEeForPeriod,
    philhealthEeCentavos:  phEeForPeriod,
    pagibigEeCentavos:     pi.ee,
    whtCentavos,
    totalDeductionsCentavos,
    sssErCentavos:         sssErForPeriod,
    philhealthErCentavos:  phErForPeriod,
    pagibigErCentavos:     pi.er,
    netPayCentavos,
    lineItems,
  }
}
