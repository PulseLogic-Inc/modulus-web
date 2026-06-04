-- CON-002, CON-003: Employment Contracts
-- PDFs are immutable once issued; edits = new contract (old superseded)
CREATE TABLE employment_contracts (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID        NOT NULL REFERENCES employees(id),
  tenant_id      UUID        NOT NULL REFERENCES tenants(id),
  contract_type  TEXT        NOT NULL,
  -- probationary | regular | project_based | casual | fixed_term | contractual
  status         TEXT        NOT NULL DEFAULT 'draft',
  -- draft | issued | signed | superseded | voided
  effective_from DATE        NOT NULL,
  effective_to   DATE,
  issued_at      TIMESTAMPTZ,
  issued_by      UUID        REFERENCES auth.users(id),
  voided_at      TIMESTAMPTZ,
  voided_by      UUID        REFERENCES auth.users(id),
  void_reason    TEXT,
  storage_path   TEXT,
  -- immutable PDF path in Supabase Storage (employee-documents bucket)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at     TIMESTAMPTZ NULL
);

CREATE INDEX idx_employment_contracts_emp    ON employment_contracts(employee_id);
CREATE INDEX idx_employment_contracts_status ON employment_contracts(tenant_id, status);
