import { describe, it, expect } from 'vitest'
import { calculateWorkedHours } from './index'
import type { WorkedHoursInput } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeDate(dateStr: string, timeStr: string): Date {
  return new Date(`${dateStr}T${timeStr}:00`)
}

const DATE = '2026-06-04' // Wednesday — regular workday
const REST  = '2026-06-07' // Sunday

/** Base input: standard Mon–Sat 8AM–5PM day shift, 1h unpaid lunch, no grace. */
function base(overrides: Partial<WorkedHoursInput> = {}): WorkedHoursInput {
  return {
    clockIn:            makeDate(DATE, '08:00'),
    clockOut:           makeDate(DATE, '17:00'),
    shiftStart:         '08:00',
    shiftEnd:           '17:00',
    breakMinutes:       60,
    breakPaid:          false,
    gracePeriodMinutes: 0,
    otThresholdMinutes: 30,
    nightDiffStart:     '22:00',
    nightDiffEnd:       '06:00',
    isRestDay:          false,
    holidayType:        null,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// 1. Standard shift — no issues
// ---------------------------------------------------------------------------

describe('Standard 8-hour shift', () => {
  it('returns 480 worked minutes with no OT, late, or undertime', () => {
    const r = calculateWorkedHours(base())
    expect(r.workedMinutes).toBe(480)    // 9h gross − 1h break
    expect(r.regularMinutes).toBe(480)
    expect(r.otMinutes).toBe(0)
    expect(r.nightDiffMinutes).toBe(0)
    expect(r.lateMinutes).toBe(0)
    expect(r.undertimeMinutes).toBe(0)
  })

  it('handles exactly 8 hours with paid break (9h gross, break not deducted)', () => {
    const r = calculateWorkedHours(base({ breakPaid: true }))
    expect(r.workedMinutes).toBe(540)   // 9h, break is paid
    expect(r.regularMinutes).toBe(480)
    expect(r.otMinutes).toBe(60)
  })
})

// ---------------------------------------------------------------------------
// 2. Overtime detection
// ---------------------------------------------------------------------------

describe('Overtime', () => {
  it('detects OT when employee works beyond 8 hours on a regular day', () => {
    const r = calculateWorkedHours(base({
      clockOut: makeDate(DATE, '19:00'), // 11h gross − 1h break = 10h
    }))
    expect(r.workedMinutes).toBe(600)
    expect(r.regularMinutes).toBe(480)
    expect(r.otMinutes).toBe(120)        // 2h OT at 1.25× (applied by payroll engine)
  })

  it('detects fractional OT (30 minutes over)', () => {
    const r = calculateWorkedHours(base({
      clockOut: makeDate(DATE, '17:30'), // 9.5h gross − 1h break = 8.5h
    }))
    expect(r.workedMinutes).toBe(510)
    expect(r.otMinutes).toBe(30)
  })

  it('reports zero OT when worked exactly 8 hours', () => {
    const r = calculateWorkedHours(base())
    expect(r.otMinutes).toBe(0)
  })

  it('reports no OT when worked less than 8 hours', () => {
    const r = calculateWorkedHours(base({
      clockOut: makeDate(DATE, '15:00'), // 7h gross − 1h break = 6h
    }))
    expect(r.workedMinutes).toBe(360)
    expect(r.otMinutes).toBe(0)
    expect(r.undertimeMinutes).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// 3. Night differential (10 PM – 6 AM, +10%)
// ---------------------------------------------------------------------------

describe('Night differential', () => {
  it('captures full 8-hour night shift (10 PM to 6 AM)', () => {
    const r = calculateWorkedHours(base({
      clockIn:    makeDate(DATE, '22:00'),
      clockOut:   makeDate('2026-06-05', '06:00'),
      shiftStart: '22:00',
      shiftEnd:   '06:00',
      breakMinutes: 0,
    }))
    expect(r.workedMinutes).toBe(480)
    expect(r.nightDiffMinutes).toBe(480)
  })

  it('captures partial night diff — clocks out before end of night window', () => {
    // Works 10 PM to 11 PM — 60 minutes all within night window
    const r = calculateWorkedHours(base({
      clockIn:    makeDate(DATE, '22:00'),
      clockOut:   makeDate(DATE, '23:00'),
      shiftStart: '20:00',
      shiftEnd:   '23:00',
      breakMinutes: 0,
    }))
    expect(r.nightDiffMinutes).toBe(60)
  })

  it('captures partial night diff — clocks in before night window starts', () => {
    // Works 8 PM to 11 PM: night window is 10 PM to 6 AM
    // Night diff portion: 10 PM to 11 PM = 60 minutes
    const r = calculateWorkedHours(base({
      clockIn:    makeDate(DATE, '20:00'),
      clockOut:   makeDate(DATE, '23:00'),
      shiftStart: '20:00',
      shiftEnd:   '05:00',
      breakMinutes: 0,
    }))
    expect(r.nightDiffMinutes).toBe(60)
  })

  it('captures night diff spanning midnight', () => {
    // Works 11 PM to 3 AM — all within night diff window
    const r = calculateWorkedHours(base({
      clockIn:    makeDate(DATE, '23:00'),
      clockOut:   makeDate('2026-06-05', '03:00'),
      shiftStart: '22:00',
      shiftEnd:   '06:00',
      breakMinutes: 0,
    }))
    expect(r.nightDiffMinutes).toBe(240)
  })

  it('captures night diff for shift ending inside morning window', () => {
    // Works 10 PM to 7 AM: night diff = 10 PM to 6 AM = 480 min, not 7 AM
    const r = calculateWorkedHours(base({
      clockIn:    makeDate(DATE, '22:00'),
      clockOut:   makeDate('2026-06-05', '07:00'),
      shiftStart: '22:00',
      shiftEnd:   '07:00',
      breakMinutes: 60,
    }))
    // Worked: 9h − 1h break = 8h = 480 min
    expect(r.workedMinutes).toBe(480)
    // Night diff: 10 PM to 6 AM = 8h = 480 min (end of night window)
    expect(r.nightDiffMinutes).toBe(480)
  })

  it('returns zero night diff for a full daytime shift', () => {
    const r = calculateWorkedHours(base())
    expect(r.nightDiffMinutes).toBe(0)
  })

  it('works correctly when night diff window does not wrap midnight', () => {
    // Edge case: non-standard night window e.g. 20:00 to 22:00
    const r = calculateWorkedHours(base({
      clockIn:    makeDate(DATE, '19:00'),
      clockOut:   makeDate(DATE, '23:00'),
      shiftStart: '19:00',
      shiftEnd:   '23:00',
      breakMinutes: 0,
      nightDiffStart: '20:00',
      nightDiffEnd:   '22:00',
    }))
    expect(r.nightDiffMinutes).toBe(120) // 8 PM to 10 PM
  })
})

// ---------------------------------------------------------------------------
// 4. Late arrival
// ---------------------------------------------------------------------------

describe('Late arrival', () => {
  it('flags as late when clock-in is past shift start', () => {
    const r = calculateWorkedHours(base({
      clockIn: makeDate(DATE, '08:30'),
    }))
    expect(r.lateMinutes).toBe(30)
  })

  it('does not flag as late when within grace period', () => {
    const r = calculateWorkedHours(base({
      clockIn:            makeDate(DATE, '08:10'),
      gracePeriodMinutes: 15,
    }))
    expect(r.lateMinutes).toBe(0)
  })

  it('flags partial late after grace period expires', () => {
    // Grace = 10 min, clocked in 20 min late → 10 min late
    const r = calculateWorkedHours(base({
      clockIn:            makeDate(DATE, '08:20'),
      gracePeriodMinutes: 10,
    }))
    expect(r.lateMinutes).toBe(10)
  })

  it('does not flag as late when exactly on time', () => {
    const r = calculateWorkedHours(base({
      clockIn: makeDate(DATE, '08:00'),
    }))
    expect(r.lateMinutes).toBe(0)
  })

  it('does not flag as late when clocking in early', () => {
    const r = calculateWorkedHours(base({
      clockIn: makeDate(DATE, '07:45'),
    }))
    expect(r.lateMinutes).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// 5. Undertime
// ---------------------------------------------------------------------------

describe('Undertime', () => {
  it('flags undertime when employee leaves before shift end', () => {
    const r = calculateWorkedHours(base({
      clockOut: makeDate(DATE, '16:30'),
    }))
    expect(r.undertimeMinutes).toBe(30)
  })

  it('does not flag undertime when clocking out exactly on time', () => {
    const r = calculateWorkedHours(base())
    expect(r.undertimeMinutes).toBe(0)
  })

  it('does not flag undertime when clocking out late', () => {
    const r = calculateWorkedHours(base({
      clockOut: makeDate(DATE, '18:00'),
    }))
    expect(r.undertimeMinutes).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// 6. Break handling
// ---------------------------------------------------------------------------

describe('Break handling', () => {
  it('deducts unpaid break from worked minutes', () => {
    const r = calculateWorkedHours(base({ breakPaid: false, breakMinutes: 60 }))
    expect(r.workedMinutes).toBe(480) // 9h gross − 1h unpaid break
  })

  it('does not deduct paid break from worked minutes', () => {
    const r = calculateWorkedHours(base({ breakPaid: true, breakMinutes: 60 }))
    expect(r.workedMinutes).toBe(540) // 9h gross, break is paid
  })

  it('handles zero break minutes', () => {
    const r = calculateWorkedHours(base({ breakMinutes: 0 }))
    expect(r.workedMinutes).toBe(540) // 9h gross − 0 break
    expect(r.otMinutes).toBe(60)
  })
})

// ---------------------------------------------------------------------------
// 7. Overnight shift
// ---------------------------------------------------------------------------

describe('Overnight shift', () => {
  it('correctly calculates worked hours for a shift spanning midnight', () => {
    // 10 PM to 6 AM — 8 hours, no break
    const r = calculateWorkedHours(base({
      clockIn:    makeDate(DATE, '22:00'),
      clockOut:   makeDate('2026-06-05', '06:00'),
      shiftStart: '22:00',
      shiftEnd:   '06:00',
      breakMinutes: 0,
    }))
    expect(r.workedMinutes).toBe(480)
    expect(r.regularMinutes).toBe(480)
    expect(r.otMinutes).toBe(0)
  })

  it('detects OT on an overnight shift', () => {
    // 10 PM to 8 AM — 10h gross, 1h break = 9h worked, 1h OT
    const r = calculateWorkedHours(base({
      clockIn:    makeDate(DATE, '22:00'),
      clockOut:   makeDate('2026-06-05', '08:00'),
      shiftStart: '22:00',
      shiftEnd:   '06:00',
      breakMinutes: 60,
    }))
    expect(r.workedMinutes).toBe(540)
    expect(r.otMinutes).toBe(60)
  })
})

// ---------------------------------------------------------------------------
// 8. Rest day (isRestDay=true) — multipliers applied by payroll engine
// ---------------------------------------------------------------------------

describe('Rest day', () => {
  it('still categorises regular and OT by the 8-hour threshold on rest days', () => {
    // DOLE: rest day = 1.30× for first 8h, 1.69× for OT — payroll engine applies rates
    const r = calculateWorkedHours(base({
      clockIn:  makeDate(REST, '08:00'),
      clockOut: makeDate(REST, '19:00'), // 11h gross − 1h break = 10h
      isRestDay: true,
    }))
    expect(r.workedMinutes).toBe(600)
    expect(r.regularMinutes).toBe(480)
    expect(r.otMinutes).toBe(120) // payroll engine will apply 1.69× to these
  })
})

// ---------------------------------------------------------------------------
// 9. Holiday scenarios — multipliers applied by payroll engine
// ---------------------------------------------------------------------------

describe('Holiday scenarios', () => {
  it('regular holiday: same time arithmetic, payroll engine applies 2.00× / 2.60×', () => {
    const r = calculateWorkedHours(base({
      holidayType: 'regular_holiday',
      clockOut:    makeDate(DATE, '19:00'), // 10h worked
    }))
    expect(r.regularMinutes).toBe(480)
    expect(r.otMinutes).toBe(120)
  })

  it('special non-working: same time arithmetic, payroll engine applies 1.30× / 1.69×', () => {
    const r = calculateWorkedHours(base({
      holidayType: 'special_non_working',
      clockOut:    makeDate(DATE, '19:00'),
    }))
    expect(r.regularMinutes).toBe(480)
    expect(r.otMinutes).toBe(120)
  })

  it('special working: treated as regular workday in time arithmetic', () => {
    const r = calculateWorkedHours(base({ holidayType: 'special_working' }))
    expect(r.workedMinutes).toBe(480)
    expect(r.otMinutes).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// 10. Edge cases and boundary conditions
// ---------------------------------------------------------------------------

describe('Edge cases', () => {
  it('returns all zeros when clock-out equals clock-in (zero duration)', () => {
    const r = calculateWorkedHours(base({
      clockIn:  makeDate(DATE, '08:00'),
      clockOut: makeDate(DATE, '08:00'),
    }))
    expect(r.workedMinutes).toBe(0)
    expect(r.regularMinutes).toBe(0)
    expect(r.otMinutes).toBe(0)
  })

  it('returns all zeros when clock-out is before clock-in (invalid)', () => {
    const r = calculateWorkedHours(base({
      clockIn:  makeDate(DATE, '17:00'),
      clockOut: makeDate(DATE, '08:00'),
    }))
    expect(r.workedMinutes).toBe(0)
  })

  it('handles very long shift (16 hours, extreme but valid)', () => {
    const r = calculateWorkedHours(base({
      clockIn:      makeDate(DATE, '06:00'),
      clockOut:     makeDate(DATE, '22:00'),
      breakMinutes: 60,
    }))
    expect(r.workedMinutes).toBe(900)  // 16h − 1h break = 15h
    expect(r.regularMinutes).toBe(480)
    expect(r.otMinutes).toBe(420)      // 7h OT
  })

  it('no undertime when shift end is before clockOut', () => {
    const r = calculateWorkedHours(base({
      clockOut: makeDate(DATE, '18:00'),
    }))
    expect(r.undertimeMinutes).toBe(0)
  })

  it('works correctly when break exceeds gross time (edge case — results in 0 worked)', () => {
    const r = calculateWorkedHours(base({
      clockIn:      makeDate(DATE, '12:00'),
      clockOut:     makeDate(DATE, '12:30'),
      breakMinutes: 60, // break longer than shift
    }))
    expect(r.workedMinutes).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// 11. Parameterised — late minutes across different grace periods
// ---------------------------------------------------------------------------

describe.each([
  { clockInTime: '08:00', grace: 0,  expectedLate: 0,  desc: 'on time, no grace' },
  { clockInTime: '08:15', grace: 0,  expectedLate: 15, desc: '15 min late, no grace' },
  { clockInTime: '08:15', grace: 15, expectedLate: 0,  desc: '15 min late, within 15 min grace' },
  { clockInTime: '08:20', grace: 15, expectedLate: 5,  desc: '20 min late, 15 min grace → 5 min late' },
  { clockInTime: '07:50', grace: 0,  expectedLate: 0,  desc: 'early arrival, no late' },
])('Late minutes — $desc', ({ clockInTime, grace, expectedLate }) => {
  it(`clocked in at ${clockInTime} with ${grace}min grace → ${expectedLate}min late`, () => {
    const r = calculateWorkedHours(base({
      clockIn:            makeDate(DATE, clockInTime),
      gracePeriodMinutes: grace,
    }))
    expect(r.lateMinutes).toBe(expectedLate)
  })
})

// ---------------------------------------------------------------------------
// 12. Parameterised — OT across different clock-out times
// ---------------------------------------------------------------------------

describe.each([
  { clockOutTime: '17:00', expectedOT: 0,   desc: 'on time' },
  { clockOutTime: '17:30', expectedOT: 30,  desc: '30 min OT' },
  { clockOutTime: '18:00', expectedOT: 60,  desc: '1h OT' },
  { clockOutTime: '19:00', expectedOT: 120, desc: '2h OT' },
  { clockOutTime: '21:00', expectedOT: 240, desc: '4h OT' },
])('OT detection — $desc', ({ clockOutTime, expectedOT }) => {
  it(`clock-out at ${clockOutTime} → ${expectedOT} OT minutes`, () => {
    const r = calculateWorkedHours(base({ clockOut: makeDate(DATE, clockOutTime) }))
    expect(r.otMinutes).toBe(expectedOT)
  })
})
