# Modulus Web — CLAUDE.md

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Source Code Structure](#source-code-structure)
4. [System Architecture](#system-architecture)
5. [Engineering Layers](#engineering-layers)
6. [Rules](#rules)
7. [Naming Conventions](#naming-conventions)
8. [Multi-Tenancy](#multi-tenancy)
9. [Supabase / Database Standards](#supabase--database-standards)
10. [Authentication & RBAC](#authentication--rbac)
11. [Audit Requirements](#audit-requirements)
12. [Payroll State Machine](#payroll-state-machine)
13. [Government Compliance Tables](#government-compliance-tables)
14. [Domain Engines](#domain-engines)
15. [Testing Standards](#testing-standards)
16. [Module Licensing](#module-licensing)
17. [Modules Roadmap](#modules-roadmap)
18. [Changelog](#changelog)

---

## Project Overview

Modulus Business Suite is a multi-tenant SaaS business operating system for Philippine SMEs.

**Current Phase:** Phase 0 — Platform Stabilization. No feature work begins until this is complete.

**Phase 0 Objectives:**
1. GitHub migration
2. Bun runtime standardization
3. Supabase project setup
4. Database migration foundation
5. RBAC foundation
6. Audit foundation
7. Core schema creation

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Runtime | Bun |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Functions | Supabase Edge Functions |
| Realtime | Supabase Realtime (limited use) |
| Hosting | Vercel |
| CI/CD | GitHub |
| Unit Testing | Vitest |
| Component Testing | Testing Library |
| E2E Testing | Playwright (future) |

### Commands

```bash
bun install       # Install dependencies
bun dev           # Start development server
bun test          # Run unit and component tests
bun run build     # Production build
```

---

## Source Code Structure

```text
src/
├── app/                        # Next.js App Router — pages, layouts, server actions, route handlers
│
├── platform/                   # Cross-cutting platform services (used by all domains)
│   ├── auth/
│   ├── tenants/
│   ├── permissions/
│   ├── audit/
│   ├── notifications/
│   ├── files/
│   ├── workflows/
│   └── reporting/
│
├── domains/                    # Business domain logic
│   ├── hr/
│   │   ├── services/           # Domain service functions
│   │   ├── repositories/       # Data access layer for this domain
│   │   └── types/
│   ├── payroll/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── types/
│   ├── finance/
│   ├── procurement/
│   ├── inventory/
│   ├── crm/
│   ├── projects/
│   └── analytics/
│
├── engines/                    # Pure function calculation engines (no side effects)
│   ├── worked-hours/
│   ├── payroll/
│   └── sil/
│
├── components/                 # Shared UI components
├── lib/                        # Shared utilities and helpers
└── types/                      # Shared TypeScript types
```

---

## System Architecture

```text
Next.js App Router (src/app/)
            ↓
Server Actions / Route Handlers       ← Orchestration only, no business rules
            ↓
Domain Services (src/domains/*/services/)   ← Business logic, calls engines + repositories
            ↓
Engines (src/engines/)                ← Pure calculation functions
Repositories (src/domains/*/repositories/)  ← Data access only
            ↓
Supabase PostgreSQL
            ↓
RLS + Audit + RBAC
```

Platform services (`src/platform/`) are shared infrastructure used across all layers — audit, auth, permissions, notifications.

---

## Engineering Layers

### Presentation Layer (`src/app/`, `src/components/`)
- Forms, dashboards, reports, user interaction
- Calls Server Actions only
- **Must NOT contain:** business logic, payroll calculations, leave calculations, attendance calculations

### Application Layer (`src/app/` — Server Actions / Route Handlers)
- Orchestration only: receive input → call domain service → return result
- Handles auth session, request validation, and response shaping
- **Must NOT contain:** business rules or direct repository calls

### Domain Layer (`src/domains/*/services/`)
- All business logic lives here
- May call engines and repositories
- **Must NOT import:** React, Next.js, Supabase client, or any UI library
- Engines within `src/engines/` are pure functions: same input always produces same output, no side effects

### Data Layer (`src/domains/*/repositories/`, `src/platform/*/repositories/`)
- SELECT, INSERT, UPDATE, RPC calls only
- Returns typed data to the domain layer
- **Must NOT contain:** business logic or calculations

---

## Rules

### Never
- Put business logic in React components, Server Actions, or Route Handlers
- Hard-delete records — use soft deletes (`deleted_at`)
- Query records without filtering `WHERE deleted_at IS NULL`
- Bypass audit logging
- Bypass RLS
- Create or alter schema manually in any environment
- Edit historical migration files
- Use `any` type in TypeScript
- Return raw Supabase errors directly to the client

### Always
- Use migrations for all schema changes
- Use repositories for all data access
- Use domain services for all business logic
- Write audit records for all business mutations
- Apply RBAC checks in the domain or application layer
- Enforce RLS at the database level
- Design every table for multi-tenancy from day one
- Filter soft-deleted records in all queries (`deleted_at IS NULL`)

---

## Naming Conventions

### TypeScript / Files
| Thing | Convention | Example |
|---|---|---|
| Files | kebab-case | `leave-service.ts` |
| Functions | camelCase | `calculateNetPay()` |
| Types / Interfaces | PascalCase | `PayrollRecord` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_OT_HOURS` |
| React components | PascalCase | `LeaveRequestForm.tsx` |

### Database
| Thing | Convention | Example |
|---|---|---|
| Tables | snake_case, plural | `employee_records` |
| Columns | snake_case | `hire_date` |
| Foreign keys | `<table_singular>_id` | `employee_id` |
| Indexes | `idx_<table>_<column>` | `idx_employees_tenant_id` |
| Migrations | `YYYYMMDDHHMMSS_description.sql` | `20240601120000_create_employees.sql` |

---

## Multi-Tenancy

Every customer is a tenant. Every business table must include:

```sql
id         UUID        PRIMARY KEY DEFAULT gen_random_uuid()
tenant_id  UUID        NOT NULL REFERENCES tenants(id)
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
deleted_at TIMESTAMPTZ NULL
```

Requirements:
- All queries must filter by `tenant_id` (enforced via RLS)
- All queries must filter `deleted_at IS NULL` unless explicitly fetching deleted records
- RLS policies must reference the authenticated user's tenant

---

## Supabase / Database Standards

All schema changes follow this workflow:

1. Write migration file
2. Open Pull Request
3. Code review
4. Merge to main
5. Deploy to environment

Migrations are **forward-only**. Never edit historical migration files. Never roll back — write a new corrective migration instead.

```text
supabase/
├── migrations/    # Timestamped SQL migration files
├── seed/          # Seed data for local development
└── config.toml    # Supabase project configuration
```

Never use the Supabase dashboard as the primary schema management tool. The migration files are the source of truth.

---

## Authentication & RBAC

### Auth Chain

```text
auth.users → profiles → tenant_memberships → roles
```

- `auth.users` — identity only (email, password, OAuth)
- `profiles` — display name, avatar, preferences
- `tenant_memberships` — links a user to a tenant with a role
- `roles` — maps to a set of permissions

Rules:
- Identity belongs in `auth.users`
- Business data belongs in application tables
- Employee data never belongs in `auth.users`

### Roles

**Initial roles:** Owner, HR Admin, Manager, Employee

### Permissions (future model)

```text
employee.create / employee.update / employee.delete
leave.approve
overtime.approve
payroll.generate / payroll.finalize / payroll.approve
finance.view / finance.post
```

### Enforcement

RBAC checks are performed in the **application or domain layer** before any mutation. RLS enforces tenant isolation at the database level as a hard boundary — it is not a substitute for application-level permission checks.

---

## Audit Requirements

All business mutations must produce an audit record via the centralized audit service at `src/platform/audit/`.

Required fields per record:

```text
actor       — user ID performing the action
tenant      — tenant ID context
timestamp   — exact time of the action
action      — verb (CREATE, UPDATE, DELETE, APPROVE, etc.)
entity      — table or domain object name
entity_id   — ID of the affected record
old_value   — JSON snapshot before change (null for creates)
new_value   — JSON snapshot after change (null for deletes)
reason      — optional justification or note
```

Requirements:
- Append-only — no updates or deletes on audit records
- Seven-year retention
- Monthly table partitioning
- Always use the centralized audit service — never implement audit inline per feature

---

## Payroll State Machine

```text
DRAFT → PROCESSING → GENERATED → FINALIZED → VOIDED
```

### Valid Transitions

| From | To | Who |
|---|---|---|
| DRAFT | PROCESSING | Payroll Admin |
| PROCESSING | GENERATED | System |
| GENERATED | FINALIZED | Payroll Approver |
| FINALIZED | VOIDED | Owner only |

Rules:
- No boolean status fields (e.g., `is_finalized`, `is_voided`)
- Use a `status` enum column
- All state transitions must produce an audit record
- Transitions outside the table above are invalid and must be rejected

---

## Government Compliance Tables

Statutory contribution tables are stored separately and are version-controlled.

```text
sss_tables
philhealth_tables
pagibig_tables
bir_tables
```

Each table must have:
- `effective_from TIMESTAMPTZ NOT NULL`
- `effective_to TIMESTAMPTZ NULL` — null means currently active

Rules:
- Never overwrite existing rows — insert a new version with updated `effective_from`
- The payroll engine selects the table version valid at the payroll period's cut-off date
- Managed via migration or seed files, not manual dashboard edits

---

## Domain Engines (`src/engines/`)

Engines are **pure functions**: deterministic, no side effects, no external calls, no database access.

| Engine | Inputs | Outputs |
|---|---|---|
| Worked Hours | Attendance records, Shift Policy | Regular Hours, OT Hours, Late Minutes |
| Payroll | Employee data, Worked Hours, Statutory Tables | Gross Pay, Deductions, Net Pay |
| SIL Accrual | Hire Date, Leave Ledger | Earned, Used, Balance |

Rules:
- Engines must never import Supabase, React, or Next.js
- Engines must be fully covered by unit tests (see Testing Standards)
- All inputs and outputs must be typed — no `any`

---

## Testing Standards

| Type | Tool | Scope |
|---|---|---|
| Unit tests | Vitest | Engines, domain services, utility functions |
| Component tests | Testing Library | UI components in isolation |
| E2E tests | Playwright (future) | Critical user journeys |

Rules:
- Engines must have 100% unit test coverage — they are pure functions with no excuse for untested paths
- Domain services must have unit tests for all business rule branches
- Tests live alongside source: `*.test.ts` next to `*.ts`
- Do not test implementation details — test behavior and output
- Do not mock the database in integration tests — use a local Supabase instance

---

## Module Licensing

Modules are enabled per-tenant via the `tenant_modules` table.

```sql
tenant_modules (
  tenant_id  UUID NOT NULL,
  module     TEXT NOT NULL,
  enabled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, module)
)
```

| tenant | module |
|---|---|
| A | hr, payroll |
| B | hr, payroll, finance |

Enforcement:
- Module access is checked in the **application layer** before routing to any domain service
- Attempting to access a disabled module returns a `403 Forbidden`
- All future development must support modular expansion — no hard coupling between domains

---

## Modules Roadmap

**MVP (Phase 1+):**
HR, Payroll, Timekeeping, Leave Management, Overtime Management, Government Compliance

**Future:**
Finance & Accounting, Procurement, Inventory, CRM, Project Management, Analytics

---

## Changelog

All significant architectural decisions, new conventions, and structural changes are recorded here.

| Date | Change | Reason |
|---|---|---|
| 2026-06-04 | CLAUDE.md created | Establish project context and engineering standards |
| 2026-06-04 | Added Testing Standards, Naming Conventions, Changelog sections | Completeness review — gaps from initial draft |
| 2026-06-04 | Clarified Domain Layer vs Engine distinction | Domain services call repositories; only engines are pure functions |
| 2026-06-04 | Added standard table template with `id` column | Missing from multi-tenancy section |
| 2026-06-04 | Added soft delete filtering rule | Implied but never stated explicitly |
| 2026-06-04 | Clarified RBAC enforcement point in the stack | Ambiguous whether app or DB layer was responsible |
| 2026-06-04 | Expanded Payroll State Machine with valid transitions table | Original diagram had no transition rules or ownership |
