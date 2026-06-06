import { z } from 'zod'

// ---------------------------------------------------------------------------
// Domain enums
// ---------------------------------------------------------------------------

export type TimekeepingStatus =
  | 'incomplete'
  | 'missing_clock'
  | 'complete'
  | 'payroll_ready'
  | 'locked'
  | 'on_leave'

// ---------------------------------------------------------------------------
// Zod schemas — used in both form validation (client) and server actions
// ---------------------------------------------------------------------------

export const ClockInSchema = z.object({
  employee_id: z.string().uuid('Employee ID is required'),
  clock_in_time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format'),
})
export type ClockInInput = z.infer<typeof ClockInSchema>

export const ClockOutSchema = z.object({
  employee_id: z.string().uuid('Employee ID is required'),
  clock_out_time: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm format'),
})
export type ClockOutInput = z.infer<typeof ClockOutSchema>

export const ManualEntrySchema = z.object({
  employee_id: z.string().uuid('Employee ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  worked_minutes: z.number().int().min(0, 'Worked minutes must be non-negative'),
  reason: z.string().max(255).optional(),
})
export type ManualEntryInput = z.infer<typeof ManualEntrySchema>
