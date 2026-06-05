import type { WorkedHoursInput, WorkedHoursResult } from './types'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseHHMM(time: string): { hours: number; minutes: number } {
  const parts = time.split(':')
  return { hours: parseInt(parts[0], 10), minutes: parseInt(parts[1], 10) }
}

function toMinuteOfDay(time: string): number {
  const { hours, minutes } = parseHHMM(time)
  return hours * 60 + minutes
}

/** Set a specific HH:mm time on a copy of the given date, optionally offset by N days. */
function setTimeOnDate(base: Date, time: string, dayOffset = 0): Date {
  const { hours, minutes } = parseHHMM(time)
  const d = new Date(base)
  d.setHours(hours, minutes, 0, 0)
  if (dayOffset !== 0) d.setDate(d.getDate() + dayOffset)
  return d
}

/** Minutes of overlap between two intervals [s1, e1) and [s2, e2). */
function overlapMinutes(s1: Date, e1: Date, s2: Date, e2: Date): number {
  const start = Math.max(s1.getTime(), s2.getTime())
  const end = Math.min(e1.getTime(), e2.getTime())
  return Math.max(0, (end - start) / 60_000)
}

// ---------------------------------------------------------------------------
// Night differential interval calculation
// ---------------------------------------------------------------------------
// The night diff window wraps midnight (e.g. 22:00 → 06:00 next day).
// We test three candidate windows anchored on day-1, day 0, and day+1 relative
// to clockIn so we never miss a window regardless of shift length.

function calcNightDiffMinutes(
  clockIn: Date,
  clockOut: Date,
  nightDiffStart: string, // e.g. '22:00'
  nightDiffEnd: string,   // e.g. '06:00'
): number {
  const startMOD = toMinuteOfDay(nightDiffStart)
  const endMOD   = toMinuteOfDay(nightDiffEnd)
  // Night diff window always wraps midnight if end <= start
  const wraps = endMOD <= startMOD

  let total = 0
  for (let offset = -1; offset <= 2; offset++) {
    const windowStart = setTimeOnDate(clockIn, nightDiffStart, offset)
    const windowEnd   = setTimeOnDate(clockIn, nightDiffEnd, wraps ? offset + 1 : offset)
    total += overlapMinutes(clockIn, clockOut, windowStart, windowEnd)
  }
  return total
}

// ---------------------------------------------------------------------------
// Main engine
// ---------------------------------------------------------------------------

/**
 * TKP-001 — Worked Hours Engine
 *
 * Pure function: same inputs → same outputs. No DB, no side effects.
 * All DOLE multipliers are applied downstream by the Payroll Engine;
 * this engine only categorises time into regular/OT/night-diff/late/undertime.
 *
 * DOLE reference: DO 18-A, Handbook on Workers' Statutory Monetary Benefits.
 */
export function calculateWorkedHours(input: WorkedHoursInput): WorkedHoursResult {
  const {
    clockIn,
    clockOut,
    shiftStart,
    shiftEnd,
    breakMinutes,
    breakPaid,
    gracePeriodMinutes,
    nightDiffStart,
    nightDiffEnd,
  } = input

  // Guard: invalid interval
  if (clockOut.getTime() <= clockIn.getTime()) {
    return { workedMinutes: 0, regularMinutes: 0, otMinutes: 0, nightDiffMinutes: 0, lateMinutes: 0, undertimeMinutes: 0 }
  }

  // --- Shift boundaries ---
  const shiftStartDt = setTimeOnDate(clockIn, shiftStart)
  const shiftStartMOD = toMinuteOfDay(shiftStart)
  const shiftEndMOD   = toMinuteOfDay(shiftEnd)
  const overnight     = shiftEndMOD <= shiftStartMOD
  const shiftEndDt    = setTimeOnDate(clockIn, shiftEnd, overnight ? 1 : 0)

  // --- Net worked minutes ---
  const grossMinutes = (clockOut.getTime() - clockIn.getTime()) / 60_000
  const deduction    = breakPaid ? 0 : breakMinutes
  const workedMinutes = Math.max(0, grossMinutes - deduction)

  // --- Late minutes ---
  // Employee is on time if they clock in within the grace window.
  const graceEndDt    = new Date(shiftStartDt.getTime() + gracePeriodMinutes * 60_000)
  const lateMinutes   = Math.max(0, (clockIn.getTime() - graceEndDt.getTime()) / 60_000)

  // --- Undertime minutes ---
  // Undertime = employee clocks out before scheduled shift end.
  const undertimeMinutes = Math.max(0, (shiftEndDt.getTime() - clockOut.getTime()) / 60_000)

  // --- Regular vs OT (DOLE: 8-hour standard workday = 480 minutes) ---
  const STANDARD = 480
  const regularMinutes = Math.min(workedMinutes, STANDARD)
  const otMinutes      = Math.max(0, workedMinutes - STANDARD)

  // --- Night differential ---
  const nightDiffMinutes = calcNightDiffMinutes(clockIn, clockOut, nightDiffStart, nightDiffEnd)

  return {
    workedMinutes:    Math.round(workedMinutes),
    regularMinutes:   Math.round(regularMinutes),
    otMinutes:        Math.round(otMinutes),
    nightDiffMinutes: Math.round(nightDiffMinutes),
    lateMinutes:      Math.round(lateMinutes),
    undertimeMinutes: Math.round(undertimeMinutes),
  }
}
