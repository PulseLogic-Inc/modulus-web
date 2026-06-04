-- Local development seed data
-- Do not use in production

INSERT INTO tenants (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Dev Company', 'dev-company')
ON CONFLICT (id) DO NOTHING;

INSERT INTO tenant_modules (tenant_id, module) VALUES
  ('00000000-0000-0000-0000-000000000001', 'hr'),
  ('00000000-0000-0000-0000-000000000001', 'payroll'),
  ('00000000-0000-0000-0000-000000000001', 'timekeeping'),
  ('00000000-0000-0000-0000-000000000001', 'leave'),
  ('00000000-0000-0000-0000-000000000001', 'overtime'),
  ('00000000-0000-0000-0000-000000000001', 'compliance')
ON CONFLICT DO NOTHING;
