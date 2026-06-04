-- COR-001 through COR-007: Timekeeping Correction Requests
-- Corrections never modify the original record directly;
-- on approval, the corrected values are applied and original preserved in audit log.
CREATE TABLE timekeeping_corrections (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id             UUID        NOT NULL REFERENCES tenants(id),
  timekeeping_record_id UUID        NOT NULL REFERENCES timekeeping_records(id),
  employee_id           UUID        NOT NULL REFERENCES employees(id),
  requested_by          UUID        NOT NULL REFERENCES auth.users(id),
  corrected_clock_in    TIMESTAMPTZ,
  corrected_clock_out   TIMESTAMPTZ,
  reason_category       TEXT        NOT NULL,
  -- missing_clock_in | missing_clock_out | wrong_time | device_failure
  -- manual_adjustment | ot_not_captured | schedule_mismatch | other
  reason_detail         TEXT,
  status                TEXT        NOT NULL DEFAULT 'pending',
  -- pending | approved | rejected | withdrawn
  reviewed_by           UUID        REFERENCES auth.users(id),
  reviewed_at           TIMESTAMPTZ,
  rejection_reason      TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at            TIMESTAMPTZ NULL
);

CREATE INDEX idx_corrections_tenant  ON timekeeping_corrections(tenant_id);
CREATE INDEX idx_corrections_status  ON timekeeping_corrections(tenant_id, status);
CREATE INDEX idx_corrections_record  ON timekeeping_corrections(timekeeping_record_id);
