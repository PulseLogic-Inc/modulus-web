-- TKP-002: Daily Timekeeping Records
-- One row per employee per date. Computed fields set by Worked Hours Engine after clock_out.
CREATE TABLE timekeeping_records (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID        NOT NULL REFERENCES tenants(id),
  employee_id        UUID        NOT NULL REFERENCES employees(id),
  date               DATE        NOT NULL,
  clock_in           TIMESTAMPTZ,
  clock_out          TIMESTAMPTZ,
  worked_minutes     INTEGER,
  -- NULL until clock_out; set by Worked Hours Engine
  ot_minutes         INTEGER     NOT NULL DEFAULT 0,
  night_diff_minutes INTEGER     NOT NULL DEFAULT 0,
  late_minutes       INTEGER     NOT NULL DEFAULT 0,
  undertime_minutes  INTEGER     NOT NULL DEFAULT 0,
  status             TEXT        NOT NULL DEFAULT 'incomplete',
  -- incomplete | missing_clock | complete | payroll_ready | locked | on_leave
  is_manual_entry    BOOLEAN     NOT NULL DEFAULT false,
  manual_entry_by    UUID        REFERENCES auth.users(id),
  auto_flagged       BOOLEAN     NOT NULL DEFAULT false,
  flag_reason        TEXT,
  -- EXCEEDS_EXPECTED | MISSING_BREAK | INVALID_TIME_ORDER | DUPLICATE | OVER_16H
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, employee_id, date)
);

CREATE INDEX idx_timekeeping_tenant_date ON timekeeping_records(tenant_id, date);
CREATE INDEX idx_timekeeping_employee    ON timekeeping_records(employee_id);
CREATE INDEX idx_timekeeping_status      ON timekeeping_records(tenant_id, status);
