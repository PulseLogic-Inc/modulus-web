import { describe, it, expect } from 'vitest'
import { calculateWorkedHours } from './index'
import type { WorkedHoursInput } from './types'

const baseInput: WorkedHoursInput = {
  clockIn: new Date('2026-06-04T08:00:00'),
  clockOut: new Date('2026-06-04T17:00:00'),
  shiftStart: '08:00',
  shiftEnd: '17:00',
  breakMinutes: 60,
  breakPaid: false,
  gracePeriodMinutes: 0,
  otThresholdMinutes: 30,
  nightDiffStart: '22:00',
  nightDiffEnd: '06:00',
  isRestDay: false,
  holidayType: null,
}

describe('calculateWorkedHours', () => {
  it('returns correct worked minutes for a standard 8-hour shift', () => {
    // 9 hours clock time - 1 hour unpaid break = 8 hours (480 minutes)
    expect(() => calculateWorkedHours(baseInput)).toThrow('not yet implemented')
    // TODO: replace with assertion once engine is implemented:
    // const result = calculateWorkedHours(baseInput)
    // expect(result.workedMinutes).toBe(480)
    // expect(result.otMinutes).toBe(0)
    // expect(result.lateMinutes).toBe(0)
  })
})
