CREATE TABLE sss_tables (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to   TIMESTAMPTZ NULL,
  min_salary     NUMERIC NOT NULL,
  max_salary     NUMERIC NOT NULL,
  employee_share NUMERIC NOT NULL,
  employer_share NUMERIC NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE philhealth_tables (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to   TIMESTAMPTZ NULL,
  rate           NUMERIC NOT NULL,
  min_salary     NUMERIC NOT NULL,
  max_salary     NUMERIC NOT NULL,
  min_premium    NUMERIC NOT NULL,
  max_premium    NUMERIC NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pagibig_tables (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to   TIMESTAMPTZ NULL,
  min_salary     NUMERIC NOT NULL,
  max_salary     NUMERIC NOT NULL,
  employee_rate  NUMERIC NOT NULL,
  employer_rate  NUMERIC NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE bir_tables (
  id             UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  effective_from TIMESTAMPTZ NOT NULL,
  effective_to   TIMESTAMPTZ NULL,
  bracket_from   NUMERIC NOT NULL,
  bracket_to     NUMERIC,
  base_tax       NUMERIC NOT NULL,
  rate           NUMERIC NOT NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
