-- PAY-002, PAY-007, PAY-009: Payroll Runs, Items, and Payslips
-- All monetary values stored as centavos (BIGINT). Floating-point arithmetic forbidden.

CREATE TABLE payroll_runs (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID        NOT NULL REFERENCES tenants(id),
  payroll_period_id       UUID        NOT NULL REFERENCES payroll_periods(id),
  status                  TEXT        NOT NULL DEFAULT 'draft',
  -- draft | processing | generated | finalized | voided
  generated_at            TIMESTAMPTZ,
  generated_by            UUID        REFERENCES auth.users(id),
  finalized_at            TIMESTAMPTZ,
  finalized_by            UUID        REFERENCES auth.users(id),
  -- finalized_by MUST be Owner role — enforced in finalize-payroll edge function
  voided_at               TIMESTAMPTZ,
  voided_by               UUID        REFERENCES auth.users(id),
  void_reason             TEXT,
  reopen_count            INTEGER     NOT NULL DEFAULT 0,
  -- increment on each reopen; blocked when >= tenant max (default 3)
  total_gross_centavos    BIGINT      NOT NULL DEFAULT 0,
  total_net_centavos      BIGINT      NOT NULL DEFAULT 0,
  total_employer_centavos BIGINT      NOT NULL DEFAULT 0,
  -- total employer SSS + PhilHealth + Pag-IBIG shares
  employee_count          INTEGER     NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payroll_items (
  id                        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id                 UUID        NOT NULL REFERENCES tenants(id),
  payroll_run_id            UUID        NOT NULL REFERENCES payroll_runs(id) ON DELETE CASCADE,
  employee_id               UUID        NOT NULL REFERENCES employees(id),
  -- Earnings (centavos)
  basic_pay_centavos        BIGINT      NOT NULL DEFAULT 0,
  ot_pay_centavos           BIGINT      NOT NULL DEFAULT 0,
  night_diff_centavos       BIGINT      NOT NULL DEFAULT 0,
  leave_pay_centavos        BIGINT      NOT NULL DEFAULT 0,
  holiday_pay_centavos      BIGINT      NOT NULL DEFAULT 0,
  allowances_centavos       BIGINT      NOT NULL DEFAULT 0,
  gross_pay_centavos        BIGINT      NOT NULL DEFAULT 0,
  -- Employee deductions (centavos)
  sss_ee_centavos           BIGINT      NOT NULL DEFAULT 0,
  philhealth_ee_centavos    BIGINT      NOT NULL DEFAULT 0,
  pagibig_ee_centavos       BIGINT      NOT NULL DEFAULT 0,
  wht_centavos              BIGINT      NOT NULL DEFAULT 0,
  late_deduction_centavos   BIGINT      NOT NULL DEFAULT 0,
  other_deductions_centavos BIGINT      NOT NULL DEFAULT 0,
  total_deductions_centavos BIGINT      NOT NULL DEFAULT 0,
  -- Employer cost (centavos)
  sss_er_centavos           BIGINT      NOT NULL DEFAULT 0,
  philhealth_er_centavos    BIGINT      NOT NULL DEFAULT 0,
  pagibig_er_centavos       BIGINT      NOT NULL DEFAULT 0,
  -- Net pay
  net_pay_centavos          BIGINT      NOT NULL DEFAULT 0,
  -- Full itemized breakdown with reason codes for audit replay
  -- e.g. [{"type":"OT_REGULAR_125","hours":2.5,"rate_centavos":86938,"amount_centavos":108672}]
  line_items                JSONB,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (payroll_run_id, employee_id)
);

CREATE TABLE payslips (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  payroll_item_id UUID        NOT NULL REFERENCES payroll_items(id),
  employee_id     UUID        NOT NULL REFERENCES employees(id),
  payroll_run_id  UUID        NOT NULL REFERENCES payroll_runs(id),
  status          TEXT        NOT NULL DEFAULT 'active', -- active | voided
  storage_path    TEXT,
  -- path to generated PDF in Supabase Storage (payslips bucket)
  -- filename convention: Modulus_Payslip_{employee_number}_{period_code}.pdf
  generated_at    TIMESTAMPTZ,
  voided_at       TIMESTAMPTZ,
  void_reason     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_payroll_runs_period   ON payroll_runs(payroll_period_id);
CREATE INDEX idx_payroll_runs_tenant   ON payroll_runs(tenant_id, status);
CREATE INDEX idx_payroll_items_run     ON payroll_items(payroll_run_id);
CREATE INDEX idx_payroll_items_emp     ON payroll_items(employee_id);
CREATE INDEX idx_payslips_employee     ON payslips(employee_id);
CREATE INDEX idx_payslips_run          ON payslips(payroll_run_id);
