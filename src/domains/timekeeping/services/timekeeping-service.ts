import { calculateWorkedHours } from '@/engines/worked-hours'
import { logAudit } from '@/platform/audit'
import {
  findRecordByDate,
  findRecordsByDateRange,
  findIncompleteRecords,
  insertRecord,
  updateRecord,
  getDaySummary,
} from '@/domains/timekeeping/repositories/timekeeping-repository'
import {
  findAllEmployees,
  findEmployeeById,
} from '@/domains/hr/repositories/employee-repository'
import {
  findActiveShiftAssignment,
  findShiftPolicyById,
} from '@/domains/hr/repositories/shift-policy-repository'
import {
  findHolidayByDate,
} from '@/domains/hr/repositories/holiday-repository'
import type { Database } from '@/types/supabase'

type TimekeepingRecord = Database['public']['Tables']['timekeeping_records']['Row']

/**
 * Record a clock-out and compute worked hours via Worked Hours Engine
 *
 * This is the critical path: fetches shift policy, calls engine, flags anomalies, logs audit.
 * The engine is a pure function — same inputs always produce same outputs.
 *
 * @param tenantId - Tenant ID
 * @param userId - Actor (user clocking out or admin entering)
 * @param employeeId - Employee ID
 * @param clockOutTime - Clock out time (HH:mm format, 24-hour)
 * @returns Updated TimekeepingRecord with calculated hours
 */
export async function recordClockOut(
  tenantId: string,
  userId: string,
  employeeId: string,
  clockOutTime: string,
): Promise<TimekeepingRecord> {
  const today = new Date().toISOString().split('T')[0]

  // 1. Fetch today's timekeeping record (must have clock_in)
  const record = await findRecordByDate(tenantId, employeeId, today)
  if (!record) throw new Error('Clock in first before clocking out')
  if (!record.clock_in) throw new Error('Clock in time is missing')

  // 2. Fetch employee + shift assignment + shift policy
  const employee = await findEmployeeById(tenantId, employeeId)
  if (!employee) throw new Error('Employee not found')

  const shiftAssignment = await findActiveShiftAssignment(employeeId)
  if (!shiftAssignment) throw new Error('Employee has no active shift assignment')

  const shiftPolicy = await findShiftPolicyById(tenantId, shiftAssignment.shift_policy_id)
  if (!shiftPolicy) throw new Error('Shift policy not found')

  // 3. Get shift for today's day of week
  const dayOfWeek = new Date(today).getDay()
  const shiftDay = shiftPolicy.shift_policy_days?.find((d) => d.day_of_week === dayOfWeek)
  if (!shiftDay) throw new Error(`No shift defined for ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek]}`)

  // 4. Check if today is a holiday (for multiplier determination)
  const holiday = await findHolidayByDate(tenantId, today)

  // 5. Build Date objects for engine (engine works with Date + HH:mm strings)
  const todayDate = new Date(today)
  const clockInDate = new Date(todayDate)
  const [inHours, inMins] = record.clock_in.split(':').map(Number)
  clockInDate.setHours(inHours, inMins, 0, 0)

  const clockOutDate = new Date(todayDate)
  const [outHours, outMins] = clockOutTime.split(':').map(Number)
  clockOutDate.setHours(outHours, outMins, 0, 0)

  // 6. Call Worked Hours Engine (pure function)
  const worked = calculateWorkedHours({
    clockIn: clockInDate,
    clockOut: clockOutDate,
    shiftStart: shiftDay.start_time,
    shiftEnd: shiftDay.end_time,
    breakMinutes: shiftDay.break_minutes,
    breakPaid: shiftDay.break_paid,
    gracePeriodMinutes: shiftPolicy.grace_period_min,
    otThresholdMinutes: shiftPolicy.ot_threshold_min,
    nightDiffStart: shiftPolicy.night_diff_start,
    nightDiffEnd: shiftPolicy.night_diff_end,
    isRestDay: shiftDay.is_rest_day,
    holidayType: holiday?.type === 'regular_holiday' ? 'regular_holiday' :
                 holiday?.type === 'special_non_working' ? 'special_non_working' : null,
  })

  // 7. Auto-flag anomalies
  const anomalies: string[] = []
  if (worked.workedMinutes > 960) anomalies.push('EXCEEDS_16_HOURS')
  if (worked.lateMinutes > 60 && !shiftDay.is_rest_day) anomalies.push('EXCESSIVE_LATE')
  if (worked.undertimeMinutes > 60) anomalies.push('UNDERTIME')
  if (clockOutDate < clockInDate) anomalies.push('INVALID_CLOCK_ORDER')

  // 8. Update record with computed hours
  const updated = await updateRecord(tenantId, record.id, {
    clock_out: clockOutTime,
    worked_minutes: worked.workedMinutes,
    ot_minutes: worked.otMinutes,
    night_diff_minutes: worked.nightDiffMinutes,
    late_minutes: worked.lateMinutes,
    undertime_minutes: worked.undertimeMinutes,
    status: 'complete',
    auto_flagged: anomalies.length > 0,
    flag_reason: anomalies.length > 0 ? anomalies.join('; ') : null,
  })

  // 9. Log audit
  await logAudit({
    tenantId,
    actor: userId,
    action: 'UPDATE',
    entity: 'timekeeping_records',
    entityId: updated.id,
    oldValue: record,
    newValue: updated,
    reason: `Clock out at ${clockOutTime}; worked ${worked.workedMinutes} min`,
  })

  return updated
}

/**
 * Record a manual timekeeping entry (for past dates or system corrections)
 * @param tenantId - Tenant ID
 * @param userId - Actor
 * @param employeeId - Employee ID
 * @param date - Date in YYYY-MM-DD format
 * @param workedMinutes - Total worked minutes
 * @param reason - Reason for manual entry
 * @returns Inserted TimekeepingRecord
 */
export async function recordManualEntry(
  tenantId: string,
  userId: string,
  employeeId: string,
  date: string,
  workedMinutes: number,
  reason?: string,
): Promise<TimekeepingRecord> {
  // Check if record already exists
  const existing = await findRecordByDate(tenantId, employeeId, date)
  if (existing) throw new Error(`Record already exists for ${date}`)

  const record = await insertRecord({
    tenant_id: tenantId,
    employee_id: employeeId,
    date,
    clock_in: null,
    clock_out: null,
    worked_minutes: workedMinutes,
    ot_minutes: 0,
    night_diff_minutes: 0,
    late_minutes: 0,
    undertime_minutes: 0,
    status: 'complete',
    is_manual_entry: true,
    manual_entry_by: userId,
    auto_flagged: false,
    flag_reason: null,
  })

  await logAudit({
    tenantId,
    actor: userId,
    action: 'CREATE',
    entity: 'timekeeping_records',
    entityId: record.id,
    newValue: record,
    reason: reason ?? 'Manual timekeeping entry',
  })

  return record
}

/**
 * Get timekeeping records for an employee (paginated)
 * @param tenantId - Tenant ID
 * @param employeeId - Employee ID
 * @param fromDate - Start date (YYYY-MM-DD)
 * @param toDate - End date (YYYY-MM-DD)
 * @returns Array of TimekeepingRecords
 */
export async function getTimekeepingRecords(
  tenantId: string,
  employeeId: string,
  fromDate: string,
  toDate: string,
): Promise<TimekeepingRecord[]> {
  return findRecordsByDateRange(tenantId, employeeId, fromDate, toDate)
}

/**
 * Get day summary (for dashboard or alerts)
 * @param tenantId - Tenant ID
 * @param date - Date in YYYY-MM-DD format
 * @returns Summary counts
 */
export async function getDaySummaryData(tenantId: string, date: string) {
  return getDaySummary(tenantId, date)
}

/**
 * Get incomplete records for a tenant (for payroll alerts)
 * @param tenantId - Tenant ID
 * @param fromDate - Only records on or after this date
 * @returns Array of incomplete records
 */
export async function getIncompleteRecords(tenantId: string, fromDate: string) {
  return findIncompleteRecords(tenantId, fromDate)
}

/**
 * Helper: Convert HH:mm time string to minutes since midnight
 * @param time - Time in HH:mm format (24-hour)
 * @returns Minutes since midnight
 */
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/**
 * Helper: Convert minutes since midnight to HH:mm format
 * @param minutes - Minutes since midnight
 * @returns Time in HH:mm format (24-hour)
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
}
