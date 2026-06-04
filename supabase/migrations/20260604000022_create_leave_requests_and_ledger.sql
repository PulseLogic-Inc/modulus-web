-- LV-003, LV-004: Leave Requests
CREATE TABLE leave_requests (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id        UUID         NOT NULL REFERENCES tenants(id),
  employee_id      UUID         NOT NULL REFERENCES employees(id),
  requested_by     UUID         NOT NULL REFERENCES auth.users(id),
  leave_type       TEXT         NOT NULL, -- sil | vl | sl | ml | pl
  start_date       DATE         NOT NULL,
  end_date         DATE         NOT NULL,
  days             NUMERIC(4,1) NOT NULL,
  -- working days only; excludes weekends + statutory holidays per employee schedule
  is_half_day      BOOLEAN      NOT NULL DEFAULT false,
  reason           TEXT         NOT NULL,
  document_path    TEXT,
  -- supporting document path in Supabase Storage (employee-documents bucket)
  -- required for ML, PL, SL > 2 days per policy
  status           TEXT         NOT NULL DEFAULT 'pending',
  -- pending | approved | rejected | cancelled | taken
  reviewed_by      UUID         REFERENCES auth.users(id),
  reviewed_at      TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ  NULL
);

-- LV-005: Leave Balance Ledger (append-only; balance always derived, never stored as counter)
CREATE TABLE leave_ledger (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id    UUID         NOT NULL REFERENCES tenants(id),
  employee_id  UUID         NOT NULL REFERENCES employees(id),
  leave_type   TEXT         NOT NULL,
  entry_type   TEXT         NOT NULL,
  -- accrual | usage | carryover | forfeit | adjustment | cash_out
  days         NUMERIC(4,1) NOT NULL,
  -- positive = credited (earned, carryover); negative = debited (used, forfeited)
  reference_id UUID,
  -- leave_request_id for usage entries; payroll_run_id for cash_out entries
  notes        TEXT,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT now()
  -- append-only: no UPDATE or DELETE
);

CREATE INDEX idx_leave_requests_tenant   ON leave_requests(tenant_id);
CREATE INDEX idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status   ON leave_requests(tenant_id, status);
CREATE INDEX idx_leave_ledger_employee   ON leave_ledger(employee_id, leave_type);
CREATE INDEX idx_leave_ledger_tenant     ON leave_ledger(tenant_id);
