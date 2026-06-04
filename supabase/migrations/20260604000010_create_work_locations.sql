-- STG-005: Work Location Setup
CREATE TABLE work_locations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  name            TEXT        NOT NULL,
  code            TEXT,
  address         TEXT,
  type            TEXT        NOT NULL DEFAULT 'branch',
  -- head_office | branch | store | office | project_site | warehouse | field | mobile
  status          TEXT        NOT NULL DEFAULT 'active', -- active | inactive
  manager_user_id UUID        REFERENCES auth.users(id),
  -- assigning a manager auto-grants branch_manager role (enforced in app layer)
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ NULL
);

CREATE INDEX idx_work_locations_tenant_id ON work_locations(tenant_id);
