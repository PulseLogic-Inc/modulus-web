-- Local development seed data
-- Do not use in production

-- ─── Platform ───────────────────────────────────────────────────────────────

INSERT INTO tenants (id, name, slug, payroll_cadence, timezone, location_label) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dev Company', 'dev-company', 'semi_monthly', 'Asia/Manila', 'Branch')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenant_modules (tenant_id, module) VALUES
  ('00000000-0000-0000-0000-000000000001', 'hr'),
  ('00000000-0000-0000-0000-000000000001', 'payroll'),
  ('00000000-0000-0000-0000-000000000001', 'timekeeping'),
  ('00000000-0000-0000-0000-000000000001', 'leave'),
  ('00000000-0000-0000-0000-000000000001', 'overtime'),
  ('00000000-0000-0000-0000-000000000001', 'compliance')
ON CONFLICT DO NOTHING;

-- ─── HR Settings ────────────────────────────────────────────────────────────

-- Default work location
INSERT INTO work_locations (id, tenant_id, name, code, type, status) VALUES
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Head Office', 'HO', 'head_office', 'active')
ON CONFLICT DO NOTHING;

-- Default shift policy: Standard Day Shift (Mon-Sat 8AM-5PM, 1h unpaid lunch, Sun rest)
INSERT INTO shift_policies (id, tenant_id, name, grace_period_min, ot_threshold_min) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Standard Day Shift', 0, 30)
ON CONFLICT DO NOTHING;

INSERT INTO shift_policy_days (shift_policy_id, day_of_week, start_time, end_time, is_rest_day, break_minutes, break_paid) VALUES
  ('00000000-0000-0000-0000-000000000010', 1, '08:00', '17:00', false, 60, false),
  ('00000000-0000-0000-0000-000000000010', 2, '08:00', '17:00', false, 60, false),
  ('00000000-0000-0000-0000-000000000010', 3, '08:00', '17:00', false, 60, false),
  ('00000000-0000-0000-0000-000000000010', 4, '08:00', '17:00', false, 60, false),
  ('00000000-0000-0000-0000-000000000010', 5, '08:00', '17:00', false, 60, false),
  ('00000000-0000-0000-0000-000000000010', 6, '08:00', '12:00', false, 0,  false),
  ('00000000-0000-0000-0000-000000000010', 0, '00:00', '00:00', true,  0,  false)
ON CONFLICT DO NOTHING;

-- Default leave policies
INSERT INTO leave_policies (tenant_id, leave_type, annual_days, accrual_method, cash_conversion) VALUES
  ('00000000-0000-0000-0000-000000000001', 'sil', 5,  'monthly', true),
  ('00000000-0000-0000-0000-000000000001', 'vl',  5,  'annual',  false),
  ('00000000-0000-0000-0000-000000000001', 'sl',  5,  'annual',  false),
  ('00000000-0000-0000-0000-000000000001', 'ml',  0,  'annual',  false),
  ('00000000-0000-0000-0000-000000000001', 'pl',  7,  'annual',  false)
ON CONFLICT DO NOTHING;

-- 2026 PH Holidays (per Presidential Proclamation; dates approximate — update per official gazette)
INSERT INTO company_holidays (tenant_id, date, name, type, source, recurring) VALUES
  ('00000000-0000-0000-0000-000000000001', '2026-01-01', 'New Year''s Day',                    'regular_holiday',     'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-04-02', 'Maundy Thursday',                    'regular_holiday',     'statutory', false),
  ('00000000-0000-0000-0000-000000000001', '2026-04-03', 'Good Friday',                        'regular_holiday',     'statutory', false),
  ('00000000-0000-0000-0000-000000000001', '2026-04-09', 'Araw ng Kagitingan (Bataan Day)',     'regular_holiday',     'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-05-01', 'Labor Day',                          'regular_holiday',     'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-06-12', 'Independence Day',                   'regular_holiday',     'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-08-31', 'National Heroes Day',                'regular_holiday',     'statutory', false),
  ('00000000-0000-0000-0000-000000000001', '2026-11-30', 'Bonifacio Day',                      'regular_holiday',     'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-12-25', 'Christmas Day',                      'regular_holiday',     'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-12-30', 'Rizal Day',                          'regular_holiday',     'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-11-01', 'All Saints'' Day',                   'special_non_working', 'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-12-08', 'Feast of the Immaculate Conception', 'special_non_working', 'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-12-24', 'Christmas Eve',                      'special_non_working', 'statutory', true),
  ('00000000-0000-0000-0000-000000000001', '2026-12-31', 'Last Day of the Year',               'special_non_working', 'statutory', false)
ON CONFLICT DO NOTHING;

-- ─── Statutory Tables (2026) ─────────────────────────────────────────────────

-- SSS MSC Contribution Table (simplified brackets; update with full official table)
-- Source: SSS Circular. Amounts in PHP.
INSERT INTO sss_tables (effective_from, effective_to, min_salary, max_salary, employee_share, employer_share) VALUES
  ('2024-01-01', NULL,  0,       4249.99, 180.00,  180.00),
  ('2024-01-01', NULL,  4250,    4749.99, 202.50,  202.50),
  ('2024-01-01', NULL,  4750,    5249.99, 225.00,  225.00),
  ('2024-01-01', NULL,  5250,    5749.99, 247.50,  247.50),
  ('2024-01-01', NULL,  5750,    6249.99, 270.00,  270.00),
  ('2024-01-01', NULL,  6250,    6749.99, 292.50,  292.50),
  ('2024-01-01', NULL,  6750,    7249.99, 315.00,  315.00),
  ('2024-01-01', NULL,  7250,    7749.99, 337.50,  337.50),
  ('2024-01-01', NULL,  7750,    8249.99, 360.00,  360.00),
  ('2024-01-01', NULL,  8250,    8749.99, 382.50,  382.50),
  ('2024-01-01', NULL,  8750,    9249.99, 405.00,  405.00),
  ('2024-01-01', NULL,  9250,    9749.99, 427.50,  427.50),
  ('2024-01-01', NULL,  9750,   10249.99, 450.00,  450.00),
  ('2024-01-01', NULL, 10250,   10749.99, 472.50,  472.50),
  ('2024-01-01', NULL, 10750,   11249.99, 495.00,  495.00),
  ('2024-01-01', NULL, 29750,   99999.99, 1350.00, 1350.00)
ON CONFLICT DO NOTHING;

-- PhilHealth 2026 (5% premium rate, ₱100,000 Monthly Basic Salary cap)
-- Employee pays 2.5%, Employer pays 2.5%
INSERT INTO philhealth_tables (effective_from, effective_to, rate, min_salary, max_salary, min_premium, max_premium) VALUES
  ('2026-01-01', NULL, 0.05, 0, 100000, 250.00, 5000.00)
ON CONFLICT DO NOTHING;

-- Pag-IBIG Fund Contribution Table
INSERT INTO pagibig_tables (effective_from, effective_to, min_salary, max_salary, employee_rate, employer_rate) VALUES
  ('2021-01-01', NULL,    0.00,  1500.00, 0.01, 0.02),
  ('2021-01-01', NULL, 1500.01, 99999.99, 0.02, 0.02)
ON CONFLICT DO NOTHING;

-- BIR TRAIN Law WHT Brackets — Semi-Monthly (RA 10963 / BIR RMC)
-- base_tax in PHP; rate as decimal (e.g. 0.20 = 20%)
INSERT INTO bir_tables (effective_from, effective_to, bracket_from, bracket_to, base_tax, rate, cadence) VALUES
  ('2023-01-01', NULL,      0.00,   10417.00,      0.00, 0.00, 'semi_monthly'),
  ('2023-01-01', NULL,  10417.01,   16666.67,      0.00, 0.15, 'semi_monthly'),
  ('2023-01-01', NULL,  16666.68,   33333.33,    937.50, 0.20, 'semi_monthly'),
  ('2023-01-01', NULL,  33333.34,   83333.33,   4312.50, 0.25, 'semi_monthly'),
  ('2023-01-01', NULL,  83333.34,  333333.33,  16937.50, 0.30, 'semi_monthly'),
  ('2023-01-01', NULL, 333333.34,        NULL, 91812.50, 0.35, 'semi_monthly')
ON CONFLICT DO NOTHING;

-- BIR TRAIN Law WHT Brackets — Monthly
INSERT INTO bir_tables (effective_from, effective_to, bracket_from, bracket_to, base_tax, rate, cadence) VALUES
  ('2023-01-01', NULL,      0.00,   20833.00,      0.00, 0.00, 'monthly'),
  ('2023-01-01', NULL,  20833.01,   33332.00,      0.00, 0.15, 'monthly'),
  ('2023-01-01', NULL,  33332.01,   66666.67,   1875.00, 0.20, 'monthly'),
  ('2023-01-01', NULL,  66666.68,  166666.67,   8625.00, 0.25, 'monthly'),
  ('2023-01-01', NULL, 166666.68,  666666.67,  33875.00, 0.30, 'monthly'),
  ('2023-01-01', NULL, 666666.68,        NULL,183625.00, 0.35, 'monthly')
ON CONFLICT DO NOTHING;

-- BIR TRAIN Law WHT Brackets — Weekly
INSERT INTO bir_tables (effective_from, effective_to, bracket_from, bracket_to, base_tax, rate, cadence) VALUES
  ('2023-01-01', NULL,     0.00,   4808.00,     0.00, 0.00, 'weekly'),
  ('2023-01-01', NULL,  4808.01,   7692.31,     0.00, 0.15, 'weekly'),
  ('2023-01-01', NULL,  7692.32,  15384.62,   433.22, 0.20, 'weekly'),
  ('2023-01-01', NULL, 15384.63,  38461.54,  1971.60, 0.25, 'weekly'),
  ('2023-01-01', NULL, 38461.55, 153846.15,  7740.38, 0.30, 'weekly'),
  ('2023-01-01', NULL,153846.16,       NULL, 42423.08, 0.35, 'weekly')
ON CONFLICT DO NOTHING;
