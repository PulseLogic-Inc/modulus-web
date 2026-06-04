-- EMP-006: Employee Status History (append-only lifecycle log)
CREATE TABLE employee_status_history (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id    UUID        NOT NULL REFERENCES employees(id),
  tenant_id      UUID        NOT NULL REFERENCES tenants(id),
  status         TEXT        NOT NULL,
  reason         TEXT,
  effective_date DATE        NOT NULL,
  actor          UUID        NOT NULL REFERENCES auth.users(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- STG-008, STG-010: Employee Shift Assignments (versioned; engine picks active on date)
CREATE TABLE employee_shift_assignments (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id     UUID        NOT NULL REFERENCES employees(id),
  tenant_id       UUID        NOT NULL REFERENCES tenants(id),
  shift_policy_id UUID        NOT NULL REFERENCES shift_policies(id),
  effective_from  DATE        NOT NULL,
  effective_to    DATE,
  -- NULL = currently active assignment
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_employee_status_history_emp ON employee_status_history(employee_id);
CREATE INDEX idx_employee_shift_assign_emp   ON employee_shift_assignments(employee_id, effective_from);
