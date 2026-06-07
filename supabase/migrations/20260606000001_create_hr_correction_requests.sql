-- Create hr_correction_requests table for timekeeping/payroll corrections
-- COR module: HR staff request corrections, HR Admin approves/rejects

CREATE TABLE hr_correction_requests (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID        NOT NULL REFERENCES tenants(id),
  employee_id         UUID        NOT NULL REFERENCES employees(id),
  timekeeping_record_id UUID      REFERENCES timekeeping_records(id),
  -- correction_type: what field to correct
  correction_type     TEXT        NOT NULL CHECK (correction_type IN ('clock_in', 'clock_out', 'worked_minutes')),
  -- proposed_value: the new value (stored as text, parsed by service)
  proposed_value      TEXT        NOT NULL,
  -- reason: why is this correction needed
  reason              TEXT        NOT NULL,
  -- status state machine: pending → approved | rejected (terminal)
  status              TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  -- approval metadata
  approved_by         UUID        REFERENCES profiles(id),
  approved_at         TIMESTAMPTZ,
  rejection_reason    TEXT,
  -- audit
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ NULL
);

-- Indexes for common queries
CREATE INDEX idx_hr_corrections_tenant_status ON hr_correction_requests(tenant_id, status);
CREATE INDEX idx_hr_corrections_employee ON hr_correction_requests(employee_id, created_at DESC);
CREATE INDEX idx_hr_corrections_timekeeping ON hr_correction_requests(timekeeping_record_id);

-- Enable RLS
ALTER TABLE hr_correction_requests ENABLE ROW LEVEL SECURITY;

-- RLS policy: tenant isolation only (RBAC enforced at app layer)
CREATE POLICY "hr_corrections_select" ON hr_correction_requests FOR SELECT
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- RLS policy: insert own corrections (anyone in tenant)
CREATE POLICY "hr_corrections_insert" ON hr_correction_requests FOR INSERT
  WITH CHECK (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- RLS policy: update (RBAC enforced at app layer via requireRole)
CREATE POLICY "hr_corrections_update" ON hr_correction_requests FOR UPDATE
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );

-- RLS policy: delete (RBAC enforced at app layer)
CREATE POLICY "hr_corrections_delete" ON hr_correction_requests FOR DELETE
  USING (
    tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
  );
