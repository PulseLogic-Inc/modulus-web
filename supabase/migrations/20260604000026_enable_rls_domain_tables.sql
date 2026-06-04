-- Enable RLS on all domain tables
ALTER TABLE work_locations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_titles                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_policies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_policy_days          ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_holidays           ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_rates             ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_status_history    ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employment_contracts       ENABLE ROW LEVEL SECURITY;
ALTER TABLE timekeeping_records        ENABLE ROW LEVEL SECURITY;
ALTER TABLE timekeeping_corrections    ENABLE ROW LEVEL SECURITY;
ALTER TABLE overtime_requests          ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_policies             ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests             ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_ledger               ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_periods            ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_runs               ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications              ENABLE ROW LEVEL SECURITY;
ALTER TABLE sss_tables                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE philhealth_tables          ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagibig_tables             ENABLE ROW LEVEL SECURITY;
ALTER TABLE bir_tables                 ENABLE ROW LEVEL SECURITY;

-- Helper: resolve current user's role within a specific tenant
CREATE OR REPLACE FUNCTION get_user_role_in_tenant(p_tenant_id UUID)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role::TEXT FROM tenant_memberships
  WHERE user_id = auth.uid()
    AND tenant_id = p_tenant_id
    AND deleted_at IS NULL
  LIMIT 1;
$$;

-- Tenant-scoped SELECT policies
-- INSERT/UPDATE/DELETE mutations use the service role client via edge functions or
-- server actions, with RBAC enforced at the application layer before the DB call.

CREATE POLICY "work_locations_select" ON work_locations FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "job_titles_select" ON job_titles FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "shift_policies_select" ON shift_policies FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "shift_policy_days_select" ON shift_policy_days FOR SELECT
  USING (shift_policy_id IN (
    SELECT id FROM shift_policies WHERE tenant_id IN (SELECT get_user_tenant_ids())
  ));

CREATE POLICY "company_holidays_select" ON company_holidays FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "employees_select" ON employees FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND deleted_at IS NULL);

CREATE POLICY "employee_rates_select" ON employee_rates FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "employee_status_history_select" ON employee_status_history FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "employee_shift_assignments_select" ON employee_shift_assignments FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "employment_contracts_select" ON employment_contracts FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND deleted_at IS NULL);

CREATE POLICY "timekeeping_records_select" ON timekeeping_records FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "timekeeping_corrections_select" ON timekeeping_corrections FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND deleted_at IS NULL);

CREATE POLICY "overtime_requests_select" ON overtime_requests FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND deleted_at IS NULL);

CREATE POLICY "leave_policies_select" ON leave_policies FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "leave_requests_select" ON leave_requests FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()) AND deleted_at IS NULL);

CREATE POLICY "leave_ledger_select" ON leave_ledger FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "payroll_periods_select" ON payroll_periods FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "payroll_runs_select" ON payroll_runs FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "payroll_items_select" ON payroll_items FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

CREATE POLICY "payslips_select" ON payslips FOR SELECT
  USING (tenant_id IN (SELECT get_user_tenant_ids()));

-- Notifications: each user sees only their own
CREATE POLICY "notifications_select_own" ON notifications FOR SELECT
  USING (user_id = auth.uid());

-- Government tables: readable by any authenticated user (Modulus-managed, no tenant scoping)
CREATE POLICY "sss_tables_select"        ON sss_tables        FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "philhealth_tables_select" ON philhealth_tables FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "pagibig_tables_select"    ON pagibig_tables    FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "bir_tables_select"        ON bir_tables        FOR SELECT USING (auth.uid() IS NOT NULL);
