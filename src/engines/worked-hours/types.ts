export interface WorkedHoursInput {
  clockIn: Date
  clockOut: Date
  shiftStart: string        // 'HH:mm' format
  shiftEnd: string          // 'HH:mm' format
  breakMinutes: number
  breakPaid: boolean
  gracePeriodMinutes: number
  otThresholdMinutes: number
  nightDiffStart: string    // 'HH:mm' — default '22:00'
  nightDiffEnd: string      // 'HH:mm' — default '06:00'
  isRestDay: boolean
  holidayType: 'regular_holiday' | 'special_non_working' | 'special_working' | null
}

export interface WorkedHoursResult {
  workedMinutes: number
  regularMinutes: number
  otMinutes: number
  nightDiffMinutes: number
  lateMinutes: number
  undertimeMinutes: number
}
