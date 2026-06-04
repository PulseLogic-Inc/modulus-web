-- EMP-004: Core Employee Records
CREATE TABLE employees (
  id                      UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID        NOT NULL REFERENCES tenants(id),
  employee_number         TEXT        NOT NULL,
  first_name              TEXT        NOT NULL,
  middle_name             TEXT,
  last_name               TEXT        NOT NULL,
  suffix                  TEXT,
  hire_date               DATE        NOT NULL,
  job_title_id            UUID        REFERENCES job_titles(id),
  work_location_id        UUID        REFERENCES work_locations(id),
  employment_type         TEXT        NOT NULL,
  -- regular | probationary | project_based | casual | fixed_term | contractual
  status                  TEXT        NOT NULL DEFAULT 'probationary',
  -- active | probationary | on_leave | awol | suspended | terminated | resigned | inactive
  compensation_type       TEXT        NOT NULL,
  -- daily | monthly
  avatar_url              TEXT,
  date_of_birth           DATE,
  contact_number          TEXT,
  email                   TEXT,
  address                 TEXT,
  emergency_contact_name  TEXT,
  emergency_contact_phone TEXT,
  tin                     TEXT,
  sss_number              TEXT,
  philhealth_number       TEXT,
  pagibig_number          TEXT,
  sil_exempt              BOOLEAN     NOT NULL DEFAULT false,
  -- true for managerial/field personnel exempt from SIL per Labor Code
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at              TIMESTAMPTZ NULL,
  UNIQUE (tenant_id, employee_number)
);

CREATE INDEX idx_employees_tenant_id        ON employees(tenant_id);
CREATE INDEX idx_employees_work_location    ON employees(work_location_id);
CREATE INDEX idx_employees_status           ON employees(tenant_id, status);
