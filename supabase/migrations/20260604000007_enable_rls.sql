ALTER TABLE tenants            ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_modules     ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs         ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_tenant_ids()
RETURNS SETOF UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT tenant_id FROM tenant_memberships
  WHERE user_id = auth.uid() AND deleted_at IS NULL;
$$;

CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

CREATE POLICY "tenants_select_member"
  ON tenants FOR SELECT
  USING (id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "memberships_select_member"
  ON tenant_memberships FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND deleted_at IS NULL);

CREATE POLICY "modules_select_member"
  ON tenant_modules FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "audit_logs_select_member"
  ON audit_logs FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));
