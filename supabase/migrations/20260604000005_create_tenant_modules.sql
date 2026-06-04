CREATE TABLE tenant_modules (
  tenant_id  UUID        NOT NULL REFERENCES tenants(id),
  module     TEXT        NOT NULL,
  enabled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, module)
);

CREATE INDEX idx_tenant_modules_tenant_id ON tenant_modules(tenant_id);
