-- EMP-005: Versioned Compensation Rates
-- Rate changes create new rows (effective_from/effective_to); old rows never modified.
-- All monetary values stored as centavos (BIGINT) — no floating point.
CREATE TABLE employee_rates (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id       UUID        NOT NULL REFERENCES employees(id),
  tenant_id         UUID        NOT NULL REFERENCES tenants(id),
  compensation_type TEXT        NOT NULL, -- daily | monthly
  rate_centavos     BIGINT      NOT NULL,
  -- e.g. ₱695.00/day → 69500; ₱25,000/month → 2500000
  effective_from    DATE        NOT NULL,
  effective_to      DATE,
  -- NULL = currently active rate
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employee_rates_employee     ON employee_rates(employee_id);
CREATE INDEX idx_employee_rates_effective    ON employee_rates(employee_id, effective_from, effective_to);
