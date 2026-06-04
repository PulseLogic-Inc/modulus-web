CREATE TABLE audit_logs (
  id        UUID        NOT NULL DEFAULT gen_random_uuid(),
  tenant_id UUID        NOT NULL,
  actor     UUID        NOT NULL,
  action    TEXT        NOT NULL,
  entity    TEXT        NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  reason    TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
) PARTITION BY RANGE (timestamp);

CREATE TABLE audit_logs_2026_06 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-06-01') TO ('2026-07-01');

CREATE TABLE audit_logs_2026_07 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-07-01') TO ('2026-08-01');

CREATE TABLE audit_logs_2026_08 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-08-01') TO ('2026-09-01');

CREATE INDEX idx_audit_logs_tenant_id ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_entity    ON audit_logs(entity, entity_id);
