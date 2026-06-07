import { z } from 'zod'

// ---------------------------------------------------------------------------
// Domain enums
// ---------------------------------------------------------------------------

export type EmploymentType =
  | 'regular'
  | 'probationary'
  | 'project_based'
  | 'casual'
  | 'fixed_term'
  | 'contractual'

export type EmployeeStatus =
  | 'active'
  | 'probationary'
  | 'on_leave'
  | 'awol'
  | 'suspended'
  | 'terminated'
  | 'resigned'
  | 'inactive'

export type CompensationType = 'daily' | 'monthly'

export type WorkLocationType =
  | 'head_office'
  | 'branch'
  | 'store'
  | 'office'
  | 'project_site'
  | 'warehouse'
  | 'field'
  | 'mobile'

export type HolidayType =
  | 'regular_holiday'
  | 'special_non_working'
  | 'special_working'
  | 'company_paid'
  | 'company_unpaid'

export type CorrectionType =
  | 'clock_in'
  | 'clock_out'
  | 'worked_minutes'

export type CorrectionStatus =
  | 'pending'
  | 'approved'
  | 'rejected'

// ---------------------------------------------------------------------------
// Zod schemas — used in both form validation (client) and server actions
// ---------------------------------------------------------------------------

export const WorkLocationSchema = z.object({
  name:    z.string().min(1, 'Name is required').max(100),
  code:    z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(255).optional().or(z.literal('')),
  type:    z.enum([
    'head_office', 'branch', 'store', 'office',
    'project_site', 'warehouse', 'field', 'mobile',
  ]),
})
export type WorkLocationInput = z.infer<typeof WorkLocationSchema>

export const ShiftPolicyDaySchema = z.object({
  day_of_week:   z.number().int().min(0).max(6),
  start_time:    z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm'),
  end_time:      z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:mm'),
  is_rest_day:   z.boolean(),
  break_minutes: z.number().int().min(0).max(240),
  break_paid:    z.boolean(),
})
export type ShiftPolicyDayInput = z.infer<typeof ShiftPolicyDaySchema>

export const ShiftPolicySchema = z.object({
  name:               z.string().min(1, 'Name is required').max(100),
  grace_period_min:   z.number().int().min(0).max(60),
  ot_threshold_min:   z.number().int().min(0).max(120),
  night_diff_enabled: z.boolean(),
  night_diff_start:   z.string().regex(/^\d{2}:\d{2}$/),
  night_diff_end:     z.string().regex(/^\d{2}:\d{2}$/),
  days:               z.array(ShiftPolicyDaySchema).length(7),
})
export type ShiftPolicyInput = z.infer<typeof ShiftPolicySchema>

export const HolidaySchema = z.object({
  date:                z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  name:                z.string().min(1, 'Name is required').max(100),
  type:                z.enum([
    'regular_holiday', 'special_non_working', 'special_working',
    'company_paid', 'company_unpaid',
  ]),
  scope:               z.enum(['company', 'location']).default('company'),
  recurring:           z.boolean().default(false),
  multiplier_override: z.number().min(1).max(4).optional().nullable(),
})
export type HolidayInput = z.infer<typeof HolidaySchema>

export const EmployeeSchema = z.object({
  first_name:             z.string().min(1, 'First name is required').max(100),
  middle_name:            z.string().max(100).optional().or(z.literal('')),
  last_name:              z.string().min(1, 'Last name is required').max(100),
  suffix:                 z.string().max(10).optional().or(z.literal('')),
  employee_number:        z.string().min(1, 'Employee number is required').max(20),
  hire_date:              z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  employment_type:        z.enum([
    'regular', 'probationary', 'project_based', 'casual', 'fixed_term', 'contractual',
  ]),
  status:                 z.enum([
    'active', 'probationary', 'on_leave', 'awol','suspended', 'terminated', 'resigned', 'inactive',
  ]),
  compensation_type:      z.enum(['daily', 'monthly']),
  rate_centavos:          z.number().int().positive('Rate must be greater than zero'),
  work_location_id:       z.string().uuid('Work location is required'),
  job_title_id:           z.string().uuid().optional().nullable(),
  // Optional personal info
  avatar_url:             z.string().url().optional().nullable(),
  date_of_birth:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal('')).nullable(),
  contact_number:         z.string().max(20).optional().or(z.literal('')).nullable(),
  email:                  z.string().email().optional().or(z.literal('')).nullable(),
  address:                z.string().max(255).optional().or(z.literal('')).nullable(),
  emergency_contact_name: z.string().max(100).optional().or(z.literal('')).nullable(),
  emergency_contact_phone:z.string().max(20).optional().or(z.literal('')).nullable(),
  // Statutory IDs — optional at creation, required before first payroll
  tin:                    z.string().max(20).optional().or(z.literal('')).nullable(),
  sss_number:             z.string().max(20).optional().or(z.literal('')).nullable(),
  philhealth_number:      z.string().max(20).optional().or(z.literal('')).nullable(),
  pagibig_number:         z.string().max(20).optional().or(z.literal('')).nullable(),
  sil_exempt:             z.boolean().default(false),
})
export type EmployeeInput = z.infer<typeof EmployeeSchema>

export const EmployeeRateSchema = z.object({
  rate_centavos:    z.number().int().positive('Rate must be greater than zero'),
  compensation_type: z.enum(['daily', 'monthly']),
  effective_from:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
export type EmployeeRateInput = z.infer<typeof EmployeeRateSchema>

export const StatusChangeSchema = z.object({
  status:         z.enum([
    'active', 'probationary', 'on_leave', 'awol',
    'suspended', 'terminated', 'resigned', 'inactive',
  ]),
  reason:         z.string().max(500).optional(),
  effective_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})
export type StatusChangeInput = z.infer<typeof StatusChangeSchema>

export const CorrectionRequestSchema = z.object({
  timekeeping_record_id: z.string().uuid('Timekeeping record is required'),
  correction_type:       z.enum(['clock_in', 'clock_out', 'worked_minutes']),
  proposed_value:        z.string().min(1, 'Proposed value is required').max(100),
  reason:                z.string().min(10, 'Reason must be at least 10 characters').max(500),
})
export type CorrectionRequestInput = z.infer<typeof CorrectionRequestSchema>

export const ApprovalSchema = z.object({
  correction_id:    z.string().uuid('Correction ID is required'),
  approval_status:  z.enum(['approved', 'rejected']),
  rejection_reason: z.string().max(500).optional(),
})
export type ApprovalInput = z.infer<typeof ApprovalSchema>

export const OvertimeRequestSchema = z.object({
  ot_date:           z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  ot_hours:          z.number().min(0.5, 'Minimum 0.5 hours').max(24, 'Maximum 24 hours'),
  ot_type:           z.enum(['regular', 'rest_day', 'holiday'], { message: 'Invalid OT type' }),
  reason_category:   z.string().min(1, 'Reason category is required'),
  reason_detail:     z.string().max(500).optional(),
  multiplier:        z.number().min(1.25, 'Multiplier must be at least 1.25'),
})
export type OvertimeRequestInput = z.infer<typeof OvertimeRequestSchema>

export const OvertimeApprovalSchema = z.object({
  overtime_id:       z.string().uuid('Overtime request ID is required'),
  approval_status:   z.enum(['approved', 'rejected']),
  estimated_cost_centavos: z.number().int().min(0).optional(),
  rejection_reason:  z.string().max(500).optional(),
})
export type OvertimeApprovalInput = z.infer<typeof OvertimeApprovalSchema>

export const LeaveRequestSchema = z.object({
  leave_type:        z.enum(['sil', 'vl', 'sl', 'ml', 'pl'], { message: 'Invalid leave type' }),
  start_date:        z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  end_date:          z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
  days:              z.number().min(0.5, 'Minimum 0.5 days').max(365, 'Maximum 365 days'),
  is_half_day:       z.boolean().default(false),
  reason:            z.string().min(10, 'Reason must be at least 10 characters').max(500),
})
export type LeaveRequestInput = z.infer<typeof LeaveRequestSchema>

export const LeaveApprovalSchema = z.object({
  leave_request_id:  z.string().uuid('Leave request ID is required'),
  approval_status:   z.enum(['approved', 'rejected']),
  rejection_reason:  z.string().min(10, 'Reason must be at least 10 characters').max(500).optional(),
})
export type LeaveApprovalInput = z.infer<typeof LeaveApprovalSchema>
