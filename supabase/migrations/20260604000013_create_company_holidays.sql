-- STG-002, STG-003, STG-004: Holiday Calendar (PH Statutory + Custom)
CREATE TABLE company_holidays (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           UUID        NOT NULL REFERENCES tenants(id),
  date                DATE        NOT NULL,
  name                TEXT        NOT NULL,
  type                TEXT        NOT NULL,
  -- regular_holiday | special_non_working | special_working | company_paid | company_unpaid
  scope               TEXT        NOT NULL DEFAULT 'company', -- company | location
  scope_location_ids  UUID[],
  -- NULL = company-wide; non-null = applies only to listed work_location ids
  source              TEXT        NOT NULL DEFAULT 'custom', -- statutory | custom
  recurring           BOOLEAN     NOT NULL DEFAULT false,
  multiplier_override NUMERIC(4,2),
  -- NULL = use DOLE statutory default multiplier for this holiday type
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ NULL
);

CREATE INDEX idx_company_holidays_tenant_date ON company_holidays(tenant_id, date);
