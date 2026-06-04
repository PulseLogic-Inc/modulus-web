-- LV-006, LV-007: Leave Policy Configuration per Tenant
CREATE TABLE leave_policies (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id          UUID         NOT NULL REFERENCES tenants(id),
  leave_type         TEXT         NOT NULL,
  -- sil | vl | sl | ml | pl
  annual_days        NUMERIC(4,1) NOT NULL DEFAULT 0,
  accrual_method     TEXT         NOT NULL DEFAULT 'annual',
  -- annual | monthly | quarterly
  eligibility_months INTEGER      NOT NULL DEFAULT 0,
  -- 0 = immediately eligible on hire
  carryover_policy   TEXT         NOT NULL DEFAULT 'disallow',
  -- allow | disallow | cap
  carryover_cap_days NUMERIC(4,1),
  cash_conversion    BOOLEAN      NOT NULL DEFAULT false,
  -- SIL cash conversion mandatory per Labor Code Art. 95 for non-exempt employees
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, leave_type)
);
