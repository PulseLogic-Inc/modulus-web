-- STG-006, STG-007: Shift Policy Templates
CREATE TABLE shift_policies (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID        NOT NULL REFERENCES tenants(id),
  name               TEXT        NOT NULL,
  grace_period_min   INTEGER     NOT NULL DEFAULT 0,
  ot_threshold_min   INTEGER     NOT NULL DEFAULT 30,
  -- OT above this threshold triggers approval flow (auto-detected OT)
  night_diff_enabled BOOLEAN     NOT NULL DEFAULT true,
  night_diff_start   TIME        NOT NULL DEFAULT '22:00',
  night_diff_end     TIME        NOT NULL DEFAULT '06:00',
  status             TEXT        NOT NULL DEFAULT 'active', -- active | inactive
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ NULL
);

-- Per-day schedule configuration for a shift policy
CREATE TABLE shift_policy_days (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_policy_id UUID        NOT NULL REFERENCES shift_policies(id) ON DELETE CASCADE,
  day_of_week     SMALLINT    NOT NULL, -- 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
  start_time      TIME        NOT NULL,
  end_time        TIME        NOT NULL,
  is_rest_day     BOOLEAN     NOT NULL DEFAULT false,
  break_minutes   INTEGER     NOT NULL DEFAULT 60,
  break_paid      BOOLEAN     NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shift_policies_tenant_id   ON shift_policies(tenant_id);
CREATE INDEX idx_shift_policy_days_policy   ON shift_policy_days(shift_policy_id);
