-- OT-001 through OT-008: Overtime Requests
CREATE TABLE overtime_requests (
  id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id               UUID         NOT NULL REFERENCES tenants(id),
  employee_id             UUID         NOT NULL REFERENCES employees(id),
  requested_by            UUID         NOT NULL REFERENCES auth.users(id),
  ot_date                 DATE         NOT NULL,
  ot_hours                NUMERIC(5,2) NOT NULL,
  -- decimal hours e.g. 2.50; DOLE soft cap 12h/day
  ot_type                 TEXT         NOT NULL,
  -- regular_day | rest_day | special_non_working | regular_holiday | special_working
  multiplier              NUMERIC(4,2) NOT NULL,
  reason_category         TEXT         NOT NULL,
  -- event | project_deadline | staffing_shortage | production_spike
  -- inventory_count | customer_demand | maintenance | training | other
  reason_detail           TEXT,
  status                  TEXT         NOT NULL DEFAULT 'pending',
  -- pending | approved | rejected | withdrawn
  reviewed_by             UUID         REFERENCES auth.users(id),
  reviewed_at             TIMESTAMPTZ,
  rejection_reason        TEXT,
  estimated_cost_centavos BIGINT,
  -- computed at approval: hours × employee_rate_centavos/8 × multiplier
  timekeeping_record_id   UUID         REFERENCES timekeeping_records(id),
  -- linked to existing timekeeping record for the OT date (OT-007)
  created_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at              TIMESTAMPTZ  NULL
);

CREATE INDEX idx_overtime_tenant   ON overtime_requests(tenant_id);
CREATE INDEX idx_overtime_status   ON overtime_requests(tenant_id, status);
CREATE INDEX idx_overtime_employee ON overtime_requests(employee_id);
CREATE INDEX idx_overtime_date     ON overtime_requests(tenant_id, ot_date);
