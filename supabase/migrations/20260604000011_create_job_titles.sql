-- STG-012: Job Titles / Positions (typeahead-driven, auto-grows)
CREATE TABLE job_titles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  UUID        NOT NULL REFERENCES tenants(id),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ NULL,
  UNIQUE (tenant_id, name)
);

CREATE INDEX idx_job_titles_tenant_id ON job_titles(tenant_id);
