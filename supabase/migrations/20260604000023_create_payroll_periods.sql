-- PAY-003, PAY-004: Payroll Periods
-- Auto-generated 6 months ahead on tenant activation (generate-payroll-periods edge function)
CREATE TABLE payroll_periods (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id   UUID        NOT NULL REFERENCES tenants(id),
  cadence     TEXT        NOT NULL,
  -- weekly | semi_monthly | bi_weekly | monthly
  period_code TEXT        NOT NULL,
  -- human-readable deterministic code:
  -- Weekly: '2026-W22 (May 25-31)'
  -- Semi-Monthly: 'August 2026 - Cutoff 1'
  -- Bi-Weekly: '2026-BW11'
  -- Monthly: 'May 2026'
  start_date  DATE        NOT NULL,
  end_date    DATE        NOT NULL, -- cutoff date
  payday      DATE        NOT NULL,
  status      TEXT        NOT NULL DEFAULT 'draft',
  -- draft | processing | generated | finalized | voided
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, period_code)
);

CREATE INDEX idx_payroll_periods_tenant ON payroll_periods(tenant_id);
CREATE INDEX idx_payroll_periods_status ON payroll_periods(tenant_id, status);
CREATE INDEX idx_payroll_periods_dates  ON payroll_periods(tenant_id, start_date, end_date);
