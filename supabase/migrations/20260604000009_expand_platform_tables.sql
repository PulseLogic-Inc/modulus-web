-- Expand tenants with config fields (TEN-001, PAY-003)
ALTER TABLE tenants
  ADD COLUMN logo_url                      TEXT,
  ADD COLUMN address                       TEXT,
  ADD COLUMN website_url                   TEXT,
  ADD COLUMN tin                           TEXT,
  ADD COLUMN authorized_signatory_name     TEXT,
  ADD COLUMN authorized_signatory_position TEXT,
  ADD COLUMN payroll_cadence               TEXT NOT NULL DEFAULT 'semi_monthly',
  ADD COLUMN timezone                      TEXT NOT NULL DEFAULT 'Asia/Manila',
  ADD COLUMN locale                        TEXT NOT NULL DEFAULT 'en-PH',
  ADD COLUMN location_label               TEXT NOT NULL DEFAULT 'Branch',
  ADD COLUMN sil_exempt                    BOOLEAN NOT NULL DEFAULT false;

-- Add Branch Manager, Accountant, Staff to role enum (TEN-002)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'branch_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'accountant';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'staff';

-- Add cadence to bir_tables — BIR WHT brackets differ per payroll cadence (PAY-001)
ALTER TABLE bir_tables
  ADD COLUMN cadence TEXT NOT NULL DEFAULT 'semi_monthly';

CREATE INDEX idx_bir_tables_cadence_effective ON bir_tables(cadence, effective_from, effective_to);
