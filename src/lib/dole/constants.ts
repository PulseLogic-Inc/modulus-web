/**
 * DOLE Multiplier Rates for Philippine Labor Law
 * Authority: DOLE DO 18-A (Revised Rules on Working Conditions)
 * Applies to: Overtime compensation, premium pay calculations
 *
 * All multipliers are relative to the employee's regular daily rate.
 * E.g., Rest Day OT = 1.69× means the employee receives 169% of their daily rate.
 */

export const DOLE_MULTIPLIERS = {
  // Regular day overtime (work beyond 8 hours on a regular working day)
  REGULAR_DAY_OT: 1.25,

  // Rest day (non-working day per company schedule)
  REST_DAY: 1.30,

  // Rest day overtime (work beyond 8 hours on a scheduled rest day)
  REST_DAY_OT: 1.69,

  // Special non-working day (non-holiday, but non-working per DOLE rules)
  SPECIAL_NON_WORKING: 1.30,

  // Special non-working day overtime
  SPECIAL_NON_WORKING_OT: 1.69,

  // Regular holiday (statutory holiday)
  REGULAR_HOLIDAY: 2.0,

  // Regular holiday overtime (work beyond 8 hours on a regular holiday)
  REGULAR_HOLIDAY_OT: 2.6,

  // Night differential (10 PM to 6 AM, added on top of other multipliers)
  NIGHT_DIFFERENTIAL_PERCENT: 0.1, // +10%
} as const

/**
 * Get multiplier for OT type
 * @param otType - Type of overtime (e.g., 'regular_day', 'rest_day', 'regular_holiday')
 * @returns Multiplier as decimal (e.g., 1.25, 1.69, 2.6)
 */
export function getOtMultiplier(
  otType:
    | 'regular_day'
    | 'rest_day'
    | 'special_non_working'
    | 'regular_holiday'
    | 'special_working',
): number {
  const multipliers: Record<string, number> = {
    regular_day: DOLE_MULTIPLIERS.REGULAR_DAY_OT,
    rest_day: DOLE_MULTIPLIERS.REST_DAY_OT,
    special_non_working: DOLE_MULTIPLIERS.SPECIAL_NON_WORKING_OT,
    regular_holiday: DOLE_MULTIPLIERS.REGULAR_HOLIDAY_OT,
    special_working: DOLE_MULTIPLIERS.REGULAR_DAY_OT, // special working day treated as regular
  }
  return multipliers[otType] ?? 1.0
}

/**
 * Apply night differential to a multiplier
 * @param baseMultiplier - Base multiplier (e.g., 1.25 for regular OT)
 * @param hasNightDiff - Whether night differential applies
 * @returns Final multiplier with night diff applied
 *
 * Example:
 * - Regular OT at night: 1.25 + (1.25 × 0.10) = 1.375
 * - Regular holiday OT at night: 2.6 + (2.6 × 0.10) = 2.86
 */
export function applyNightDifferential(
  baseMultiplier: number,
  hasNightDiff: boolean,
): number {
  if (!hasNightDiff) return baseMultiplier
  return baseMultiplier + baseMultiplier * DOLE_MULTIPLIERS.NIGHT_DIFFERENTIAL_PERCENT
}

/**
 * Check if a date is within night diff window (10 PM to 6 AM)
 * @param hour - Hour of day (0-23)
 * @returns true if within night diff window
 */
export function isNightDiffHour(hour: number): boolean {
  // Night diff: 10 PM (22) to 6 AM (6)
  return hour >= 22 || hour < 6
}

/**
 * DOLE soft cap on OT per day (for wage protection purposes)
 * No employee should work more than 12 hours per day without special authorization
 * This is not a hard legal limit but a guideline for labor practices
 */
export const DOLE_OT_SOFT_CAP_HOURS = 12

/**
 * DOLE maximum work day (as per Labor Code)
 * Total work hours (including OT) should not exceed 16 hours per day under normal circumstances
 */
export const DOLE_MAX_WORK_DAY_HOURS = 16

/**
 * Standard work day in the Philippines (Labor Code, Art. 83)
 */
export const STANDARD_WORK_DAY_HOURS = 8

/**
 * Minimum rest period between work days (Labor Code, Art. 85)
 * In hours per day
 */
export const MINIMUM_REST_PERIOD_HOURS = 8
