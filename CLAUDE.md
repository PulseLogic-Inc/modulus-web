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
13. [Payroll Cadence](#payroll-cadence)
14. [Payroll Arithmetic Rules](#payroll-arithmetic-rules)
15. [Leave Management Rules](#leave-management-rules)
16. [Government Compliance Tables](#government-compliance-tables)
17. [Domain Engines](#domain-engines)
18. [Engine Build Priority](#engine-build-priority)
19. [Testing Standards](#testing-standards)
20. [Module Licensing](#module-licensing)
21. [Modules Roadmap](#modules-roadmap)
22. [UI Design System](#ui-design-system)
23. [Critical Deadlines](#critical-deadlines)
24. [Backlog Ticket Reference](#backlog-ticket-reference)
25. [Changelog](#changelog)

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
| Icons | Font Awesome |
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

| Role | Scope | Notes |
|---|---|---|
| Owner | Tenant-wide | Exactly one per tenant (transferable, not duplicable). Payroll approval is Owner-only — non-configurable. |
| HR Admin | Tenant-wide | Multi-user. Day-to-day HR operations. Cannot approve payroll. |
| Branch Manager | Location-scoped | Scoped to assigned work location(s). Read-only on most records outside their location. |
| Accountant | Tenant-wide | Finance module access. Phase 2+. |
| Staff / Employee | Self only | Self-service access. Phase 3+. |

Rules:
- Exactly one Owner per tenant at all times
- Branch Manager role is auto-granted when a user is assigned as Manager to a work location (STG-005)
- Branch Manager sees only employees at their assigned location — enforced server-side via RLS
- Payroll approval (`payroll.finalize`) is **Owner-only, hard-coded, not configurable**

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

### Authentication Rules

- **No public sign-up.** Sign-in page has no "Create Account" link.
- New users are invited by Owner/HR Admin via the `invite-user` edge function — invite email delivered via Supabase Auth.
- Invite links expire after **72 hours** and are single-use.
- Session expiry: **24-hour sliding session** for web.
- Failed login rate limit: **5 failed attempts → 15-minute lockout** per email/IP.
- Password reset is self-service via "Forgot password?" — link is one-time-use, expires in 1 hour.
- Passwords: minimum 8 characters, mix of letters and numbers. Stored as bcrypt hash — never plaintext.
- Password reset response is identical whether the email exists or not (anti-enumeration).

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

| From | To | Who | Notes |
|---|---|---|---|
| DRAFT | PROCESSING | HR Admin | Triggered by "Generate Payroll" |
| PROCESSING | GENERATED | System | Auto on successful compute |
| PROCESSING | DRAFT | System | Auto-rollback on compute failure |
| GENERATED | DRAFT | Owner | Owner rejects; requires reason |
| GENERATED | FINALIZED | Owner only | Requires password re-entry. Locks run, publishes payslips, writes ledger. |
| FINALIZED | DRAFT | Owner only | Reopen; requires 50-char reason + password. Voids payslips, reverses ledger via offsetting entries. Max 3 reopens (configurable). |
| FINALIZED | VOIDED | Owner only | Terminal state. Requires 50-char reason + password. Use for catastrophic errors only. |

Rules:
- No boolean status fields (e.g., `is_finalized`, `is_voided`)
- Use a `status` enum column
- All state transitions must produce an audit record with full snapshot
- Transitions outside the table above are invalid and must be rejected
- **Payroll approval is Owner-only — HR Admin cannot finalize payroll under any configuration**
- Ledger entries are **never deleted** — reversals are made via offsetting entries (double-entry preserved)
- Concurrent compute attempts on the same period must be blocked
- Payroll reset (delete computed data for DRAFT/GENERATED period) is Owner-only with triple-confirm + period code re-entry

---

## Payroll Cadence

Modulus supports four payroll cadences. The tenant configures one at onboarding; mid-year changes are restricted to year-end transitions.

| Cadence | Cutoff | Payday | Notes |
|---|---|---|---|
| Weekly | Configurable workweek end (default Saturday) | Default Wednesday | **Required for construction SMEs.** Non-negotiable for CADCC pilot. |
| Semi-Monthly | 15th & 30th | 21st & 6th | Default. DOLE DO 18-A standard. |
| Bi-Weekly | Every 14 days (configurable anchor) | Configurable | — |
| Monthly | End of month | Default 5th of following month | — |

Rules:
- Statutory contributions (SSS, PhilHealth, Pag-IBIG) **always aggregate monthly** for filing regardless of cadence.
- BIR WHT brackets have **separate tables per cadence** (daily, weekly, semi-monthly, monthly) — never use semi-monthly table for weekly payroll.
- Holiday-adjusted payday rule applies to all cadences (configurable: Forward / Backward / Stay).
- Period codes are human-readable and deterministic: `2026-W22 (May 25–31)`, `August 2026 – Cutoff 1`, `2026-BW11`, `May 2026`.
- Pag-IBIG deduction timing per cadence: Semi-Monthly → Cycle B; Weekly → last full week of month; Bi-Weekly → second period of month; Monthly → single period.

---

## Payroll Arithmetic Rules

These rules are non-negotiable. Violating them causes silent payroll errors.

- **Floating-point arithmetic is FORBIDDEN.** Store all monetary values as integers in centavos (e.g., ₱695.00 = `69500`). Display with 2 decimal places.
- Every payroll line item must carry a **reason code** (e.g., `OT_REGULAR_125`, `WHT_BRACKET_3`, `NIGHT_DIFF_10PCT`) for audit replay.
- The Payroll Compute Engine is a **pure function** — same inputs always produce same outputs. No DB writes inside the engine.
- DOLE multipliers for reference (configurable per tenant in Phase 2; hardcoded statutory constants at MVP):

| Scenario | Multiplier |
|---|---|
| Regular day OT (>8h) | 1.25× |
| Rest day | 1.30× |
| Rest day OT | 1.69× |
| Special non-working | 1.30× |
| Special non-working OT | 1.69× |
| Regular holiday | 2.00× |
| Regular holiday OT | 2.60× |
| Night differential (10 PM–6 AM) | +10% |

- All DOLE multiplier math is server-side only via the Worked Hours Engine — never computed on the client.
- The Preview compute uses the **exact same engine** as Generate — no separate "preview math."

---

## Leave Management Rules

### Leave Types

| Code | Name | Basis | Accrual | Pay Rule |
|---|---|---|---|---|
| SIL | Service Incentive Leave | Labor Code Art. 95 | 5 days/year at 1-year service anniversary | Regular daily rate |
| VL | Vacation Leave | Company policy | Configurable | Configurable (default full pay) |
| SL | Sick Leave | Company policy | Configurable | Configurable (default full pay) |
| ML | Maternity Leave | RA 11210 | Event-based (no balance) | Employer advances; SSS reimburses — flagged as "SSS-reimbursable" |
| PL | Paternity Leave | RA 8187 | Event-based (7 days) | Employer pays at regular rate |

### Leave Balance Rules

- Leave balance is **derived, never stored as a denormalized counter.** Compute live from ledger entries.
- Formula: `Remaining = Earned – Used + Carryover`
- Every accrual, usage, and carryover is a **ledger entry** (same principle as accounting double-entry).
- SIL accrual engine runs nightly as a background job — must be idempotent.
- SIL exempt employees: companies with <10 workers (configurable at tenant level); managerial/field personnel (configurable per employee).
- Working days calculation for leave duration excludes weekends and statutory holidays per employee's schedule.
- Half-day leave stored as `0.5` days.
- Leave dates auto-create timekeeping records tagged "On Leave: [type]" — these are excluded from the Incomplete Records alert and auto-flag rules.

### Year-End Processing

- **Hard deadline: process by November 30, 2026** (to meet December 24 SIL cash conversion requirement).
- Unused SIL cash conversion is **mandatory** per Labor Code Art. 95 for non-exempt employees.
- Year-end processing is configurable: carryover, forfeit, or cash conversion per leave type per company policy.

---



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

## Engine Build Priority

The two computation engines must be built **before any feature UI** — treat them as Sprint 0 deliverables.

1. **Worked Hours Engine** (`src/engines/worked-hours/`) — needed by Timekeeping, Payroll, and OT modules.
2. **Payroll Compute Engine** (`src/engines/payroll/`) — needed by Payroll, Reports, and 13th Month modules.

Both engines require **exhaustive unit tests** covering every DOLE scenario (OT types, holiday multipliers, cadence boundaries, WHT bracket edges, leave pay types) before any UI code consumes them. If the engine is wrong, every downstream feature is wrong.

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

### MVP (Phase 1)

| Module | Ticket Prefix | Key Scope |
|---|---|---|
| Authentication | AUTH | Email/password sign-in, invite-only accounts, forgot password |
| Tenant / System | TEN | Tenant config, RBAC, audit log, notifications |
| HR Settings | STG | Holidays, shift policies, work locations, job titles |
| Employees | EMP | Employee list, add/edit, status lifecycle, location assignment |
| Employment Contracts | CON | Auto-generate PH-standard contracts, contract history |
| Timekeeping | TKP | Worked hours calc engine, daily records, OT detection, summary reports |
| Corrections | COR | Timekeeping correction requests, approval workflow |
| Overtime | OT | OT requests, approval with cost estimate, linking to timekeeping |
| Leaves | LV | Leave requests, SIL accrual engine, balance ledger, payroll integration |
| Payroll | PAY | Compute engine, lifecycle state machine, payslips, statutory remittances |
| Government Reports | RPT | SSS R3, PhilHealth RF-1, Pag-IBIG MCRF (CSV exports) |
| HR Dashboard | DASH | Monthly KPI overview (7 cards), PDF export |

### Phase 2

- Probationary contract compliance alerts (CON)
- Digital contract signing via Lumin (CON)
- Tenant-configurable DOLE multipliers (STG)
- Shift policy impact preview (STG)
- Leave calendar view (LV)
- Year-end leave conversion / carryover processing (LV)
- 13th Month Pay computation per PD 851 (PAY) — **hard deadline Dec 24, 2026**
- BIR Alphalist annual report — **hard deadline Jan 31, 2027**
- BIR Form 2316 bulk generation — **hard deadline Jan 31, 2027**
- Payroll summary across periods (PAY)
- Multi-tenant branded sign-in page (AUTH)
- ID Badge generator (BDG)

### Phase 3

- Employee self-service (leave filing, payslip access)
- Project P&L dashboard for construction (PRJ)
- Receipt OCR for materials cost capture (PRJ)
- Badge QR employee verification (BDG)
- Finance & Accounting, Procurement, Inventory, CRM, Analytics

---

## UI Design System

All UI must use **Tailwind CSS**, **shadcn/ui primitives**, and **Font Awesome** exclusively. The design language is **Corporate Bento** — a professional paradigm blending corporate minimalism with structured bento grid modular layouts.

### Component Rules

**Card containers** — always use shadcn semantic tokens:
```
bg-card text-card-foreground border-border rounded-xl shadow-sm
```

**Grid layouts** — bento grid structure:
```
grid grid-cols-1 md:grid-cols-3 gap-6
```

**Card hierarchy** — asymmetric spans:
- Primary / feature cards: `md:col-span-2`
- Supporting / metric cards: `md:col-span-1`

**Padding** — strict `p-6` or `p-8` inside cards, never mixed.

**Section wrapper:**
```
max-w-7xl mx-auto px-6 py-20 bg-background
```

### Typography

| Use | Classes |
|---|---|
| Section label | `text-sm font-semibold tracking-wider uppercase text-primary` |
| Page / section heading | `scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground` |
| Card heading | `text-xl font-bold tracking-tight text-foreground` |
| Body / description | `text-lg text-muted-foreground` |
| Muted supporting text | `text-sm text-muted-foreground leading-relaxed` |
| Large stat number | `text-5xl font-extrabold tracking-tight text-foreground` |

### Font Awesome Icons

- **Sizing:** `fa-lg` or `fa-xl` for context icons; `fa-sm` / `fa-md` inside small data cards
- **Color:** `text-muted-foreground` (default) or `text-primary` / `text-blue-600` for accents
- **Container chip** — always wrap icons in:
  ```
  w-10 h-10 rounded-lg bg-secondary flex items-center justify-center
  ```
- **Placement:** icon chip placed directly before the card heading

### Reference Pattern

```html
<section class="max-w-7xl mx-auto px-6 py-20 bg-background">
  <div class="max-w-3xl mb-12">
    <p class="text-sm font-semibold tracking-wider uppercase text-primary mb-2">Module Label</p>
    <h2 class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
      Section heading here.
    </h2>
    <p class="mt-4 text-lg text-muted-foreground">Supporting description text.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

    <!-- Primary card (2 cols) -->
    <div class="md:col-span-2 rounded-xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <i class="fa-solid fa-icon-name text-primary fa-lg"></i>
          </div>
          <h3 class="text-xl font-bold tracking-tight text-foreground">Card Title</h3>
        </div>
        <p class="text-sm text-muted-foreground max-w-xl">Card description text.</p>
      </div>
    </div>

    <!-- Metric card (1 col) -->
    <div class="rounded-xl border bg-card text-card-foreground shadow-sm p-8 flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
            <i class="fa-solid fa-icon-name text-muted-foreground fa-lg"></i>
          </div>
          <h3 class="text-xl font-bold tracking-tight text-foreground">Metric Title</h3>
        </div>
      </div>
      <div class="mt-8">
        <div class="text-5xl font-extrabold tracking-tight text-foreground">0</div>
        <p class="mt-2 text-xs text-muted-foreground">Supporting context</p>
      </div>
    </div>

  </div>
</section>
```

---

## Critical Deadlines

| Deadline | Feature | Ticket | Notes |
|---|---|---|---|
| Nov 30, 2026 | 13th Month Pay build-ready | PAY-021, PAY-024 | PD 851 — release to employees by Dec 24, 2026 |
| Nov 30, 2026 | Year-end leave conversion/carryover processing | LV-011 | Labor Code Art. 95 — unused SIL cash conversion mandatory |
| Dec 24, 2026 | 13th Month Pay released to all eligible employees | PAY-024 | Hard legal deadline per PD 851 |
| Jan 31, 2027 | BIR Alphalist (Form 1604-C / 1604-CF) | RPT-007 | Annual filing — must cover all employees who received compensation in 2026 |
| Jan 31, 2027 | BIR Form 2316 bulk generation | RPT-008 | Legally required certificate per employee — BIR audits this |

---

## Backlog Ticket Reference

Ticket IDs follow the format `PREFIX-NNN`. Use these prefixes when referencing backlog items in commits, PRs, and comments.

| Prefix | Module |
|---|---|
| AUTH | Authentication |
| TEN | Tenant / System (RBAC, audit, notifications) |
| STG | HR Settings (holidays, shifts, work locations, positions) |
| EMP | Employees |
| CON | Employment Contracts |
| TKP | Timekeeping |
| COR | Corrections (Timekeeping) |
| OT | Overtime |
| LV | Leaves |
| PAY | Payroll |
| RPT | Reports (Government Remittance) |
| DASH | HR Dashboard |
| BDG | ID Badge |
| PRJ | Projects (P&L Wedge — Phase 3) |

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
| 2026-06-04 | Supabase CLI initialized — `supabase/config.toml` present | Phase 0: Supabase project setup |
| 2026-06-04 | 8 forward-only migration files created | Phase 0: database migration foundation + core schema |
| 2026-06-04 | RLS enabled on all platform tables with tenant-scoped policies | Security boundary enforced at DB level |
| 2026-06-04 | Auth trigger created — profile auto-created on `auth.users` insert | Keeps identity and profile in sync without app-layer overhead |
| 2026-06-04 | Government compliance tables added (SSS, PhilHealth, Pag-IBIG, BIR) | Versioned via `effective_from` / `effective_to` — never overwritten |
| 2026-06-04 | `audit_logs` partitioned table created with 3 initial monthly partitions | Append-only, 7-year retention, monthly partitioning strategy |
| 2026-06-04 | Seed data added — dev tenant + all MVP modules enabled | Local development baseline |
| 2026-06-04 | Edge function `invite-user` implemented | Handles user invite + tenant_membership creation via service role |
| 2026-06-04 | `.env.example` created | Documents required Supabase environment variables |
| 2026-06-04 | Added backlog to project context | HR backlog CSV (AUTH through PRJ modules) ingested; CLAUDE.md enriched with ticket reference, deadlines, roles, payroll rules, leave rules, cadence, and roadmap phases |
| 2026-06-04 | Updated RBAC roles to match backlog | Owner/HR Admin/Branch Manager/Accountant/Staff — Branch Manager is location-scoped |
| 2026-06-04 | Added Authentication Rules section | Invite-only, 72h invite expiry, 24h session, 5-attempt lockout, anti-enumeration password reset |
| 2026-06-04 | Expanded Payroll State Machine transitions | Added PROCESSING→DRAFT rollback, GENERATED→DRAFT rejection, FINALIZED→DRAFT reopen path |
| 2026-06-04 | Added Payroll Cadence section | Weekly/Semi-Monthly/Bi-Weekly/Monthly support; Pag-IBIG deduction timing per cadence |
| 2026-06-04 | Added Payroll Arithmetic Rules section | Floating-point forbidden; centavo integers; reason codes on every line; DOLE multiplier table |
| 2026-06-04 | Added Leave Management Rules section | Leave types (SIL/VL/SL/ML/PL), balance-from-ledger rule, working days convention, SIL accrual |
| 2026-06-04 | Added Engine Build Priority section | Worked Hours + Payroll engines built before any UI — Sprint 0 |
| 2026-06-04 | Expanded Modules Roadmap with ticket prefixes and phase breakdown | Derived from backlog CSV |
| 2026-06-04 | Added Critical Deadlines section | 13th month (Dec 24, 2026), leave processing (Nov 30, 2026), BIR reports (Jan 31, 2027) |
| 2026-06-04 | Added Backlog Ticket Reference section | Ticket prefix → module mapping for PR/commit references |
| 2026-06-04 | Migrations 9–26 created — all MVP domain tables | STG, EMP, CON, TKP, COR, OT, LV, PAY, notifications, RLS for all tables |
| 2026-06-04 | `tenants` expanded with config columns (logo, tin, payroll_cadence, timezone, etc.) | TEN-001, PAY-003 |
| 2026-06-04 | `user_role` enum expanded — added branch_manager, accountant, staff | TEN-002 backlog alignment |
| 2026-06-04 | `bir_tables` gained `cadence` column — BIR WHT brackets differ per payroll cadence | PAY-001 |
| 2026-06-04 | Seed data expanded — statutory tables (SSS, PhilHealth, Pag-IBIG, BIR), 2026 PH holidays, default shift policy, leave policies | Local dev baseline |
| 2026-06-04 | Storage buckets configured — employee-documents, payslips, tenant-assets | CON, PAY-009, TEN-001 |
| 2026-06-04 | Edge functions added — generate-payroll-periods, approve-overtime, approve-leave, finalize-payroll, reopen-payroll | PAY-004, OT-004, LV-004, PAY-008, PAY-016 |
| 2026-06-04 | Realtime enabled on `notifications` table | TEN-004 in-app notification center |
| 2026-06-04 | Added UI Design System section + Font Awesome to tech stack | Official stack locked: Tailwind CSS + shadcn/ui + Font Awesome, Corporate Bento pattern |
| 2026-06-04 | Next.js 15 project scaffolded | package.json, tsconfig, next.config.ts, Tailwind v4, shadcn/ui, middleware, auth flow, platform layer, engine stubs |
| 2026-06-04 | Supabase TypeScript types generated | src/types/supabase.ts auto-generated from remote project — covers all 26 tables + enums |
