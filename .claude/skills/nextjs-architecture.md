# Skill: Modulus Next.js 15 Architecture

This skill governs how CLAUDE.md's layered architecture maps to actual Next.js 15 App Router files and folders. Every scaffold decision, file placement, and data flow must follow these patterns.

---

## Layer → File Path Mapping

```
Presentation Layer     src/app/                        Pages, layouts, loading, error
                       src/components/                 Shared UI components

Application Layer      src/app/**/actions/             Server Actions (orchestration only)
                       src/app/api/**/route.ts         Route Handlers (webhook/external)

Domain Layer           src/domains/{domain}/services/  Business logic
                       src/engines/{engine}/           Pure calculation functions

Data Layer             src/domains/{domain}/repositories/  DB access (SELECT/INSERT/UPDATE/RPC)
                       src/platform/{service}/repositories/

Platform Services      src/platform/auth/              Auth helpers
                       src/platform/audit/             Centralized audit service
                       src/platform/tenants/           Tenant context resolution
                       src/platform/permissions/       RBAC checks
                       src/platform/notifications/     Notification dispatch

Shared                 src/lib/                        Utilities, Supabase client factories
                       src/types/                      Shared TypeScript types + DB types
```

---

## The One Rule for Every Feature

```
src/app/.../actions/foo.ts        ← receives input, calls domain service, returns result
        ↓
src/domains/hr/services/foo.ts    ← applies business rules, calls engine + repository
        ↓
src/engines/worked-hours/index.ts ← pure calculation (no DB, no imports from app/domains)
src/domains/hr/repositories/foo.ts ← DB call only (no business logic)
        ↓
Supabase PostgreSQL
```

**Never cross layers upward.** A repository never imports a service. A service never imports a Server Action. An engine never imports anything outside its own folder.

---

## Server Actions — Orchestration Only

Server Actions live at `src/app/{route-group}/**/actions/*.ts`.

```typescript
// src/app/(hr)/employees/actions/create-employee.ts
'use server'

import { createEmployee } from '@/domains/hr/services/employee-service'
import { requireRole } from '@/platform/permissions'
import { requireTenant } from '@/platform/tenants'

export async function createEmployeeAction(formData: FormData) {
  const tenant = await requireTenant()
  await requireRole(tenant.id, ['owner', 'hr_admin'])

  // Validate input at the boundary (Zod)
  const parsed = CreateEmployeeSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors }

  // Delegate all business logic to domain service
  return createEmployee(tenant.id, parsed.data)
}
```

**Must NOT contain:** rate calculations, leave balance logic, payroll math, status transitions, OT multipliers — these belong in domain services or engines.

---

## Domain Services — Business Logic

Domain services live at `src/domains/{domain}/services/*.ts`.

```typescript
// src/domains/hr/services/employee-service.ts
import { getActiveRate } from '@/domains/hr/repositories/employee-rate-repository'
import { logAudit } from '@/platform/audit'
import type { CreateEmployeeInput, Employee } from '@/domains/hr/types'

// No React imports. No Next.js imports. No Supabase client directly.
export async function createEmployee(
  tenantId: string,
  input: CreateEmployeeInput
): Promise<Employee> {
  // Business rule: employee_number must be unique within tenant
  // Business rule: hire_date cannot be in the future
  // Business rule: statutory IDs optional at creation, required before first payroll

  const employee = await employeeRepository.insert(tenantId, input)

  await logAudit({
    tenantId,
    actor: input.createdBy,
    action: 'CREATE',
    entity: 'employees',
    entityId: employee.id,
    newValue: employee,
  })

  return employee
}
```

---

## Engines — Pure Functions

Engines live at `src/engines/{name}/index.ts`. Zero side effects, zero imports from `src/app/`, `src/domains/`, or `src/platform/`.

```typescript
// src/engines/worked-hours/index.ts
import type { WorkedHoursInput, WorkedHoursResult } from './types'

// Same inputs → same outputs, always
export function calculateWorkedHours(input: WorkedHoursInput): WorkedHoursResult {
  // All DOLE arithmetic here. No DB. No fetch. No logging.
}
```

Every engine must have a co-located test file: `src/engines/{name}/index.test.ts` with 100% branch coverage.

---

## Repositories — Data Access Only

Repositories live at `src/domains/{domain}/repositories/*.ts`.

```typescript
// src/domains/hr/repositories/employee-repository.ts
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/supabase'

// SELECT, INSERT, UPDATE, RPC only. No business logic.
export async function findActiveEmployees(tenantId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('deleted_at', null)
    .eq('status', 'active')

  if (error) throw error
  return data
}
```

**Always filter:** `deleted_at IS NULL` on every query. RLS enforces `tenant_id` at the DB level, but always pass it explicitly too.

---

## Supabase Client Factories

```
src/lib/supabase/server.ts     ← Server Components, Server Actions, Route Handlers
src/lib/supabase/client.ts     ← Client Components (browser)
src/lib/supabase/middleware.ts ← Session refresh in middleware.ts
src/lib/supabase/admin.ts      ← Service role client (edge functions, admin operations)
```

```typescript
// src/lib/supabase/server.ts
import { createServerClient as createClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/supabase'

export async function createServerClient() {
  const cookieStore = await cookies()
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll() } }
  )
}
```

**Never** use the service role key in client-facing code. Service role client (`admin.ts`) is only for Server Actions that need to bypass RLS (e.g., audit log writes, invite flows).

---

## App Router File Conventions

```
src/app/
├── (auth)/                      # Route group — no URL segment
│   ├── sign-in/
│   │   └── page.tsx
│   └── layout.tsx
├── (dashboard)/                 # Authenticated area
│   ├── layout.tsx               # Session check + tenant resolution
│   ├── hr/
│   │   ├── employees/
│   │   │   ├── page.tsx         # Server Component — fetch + render
│   │   │   ├── loading.tsx      # Suspense fallback
│   │   │   ├── error.tsx        # Error boundary
│   │   │   └── actions/
│   │   │       └── employee-actions.ts   # Server Actions
│   │   └── layout.tsx
│   └── payroll/
│       └── ...
├── api/
│   └── webhooks/                # Route Handlers for external services only
└── layout.tsx                   # Root layout — fonts, providers
```

Route groups `(auth)` and `(dashboard)` share no URL namespace — use them to scope layouts without adding path segments.

---

## Component File Conventions

```
src/components/
├── ui/                          # shadcn/ui primitives (auto-generated, do not edit)
├── shared/                      # Reused across domains (DataTable, PageHeader, etc.)
└── {domain}/                    # Domain-specific components
    └── hr/
        ├── employee-card.tsx
        └── employee-form.tsx
```

**Server Component by default.** Add `'use client'` only when the component needs hooks, event handlers, or browser APIs. Keep `'use client'` at the leaf level — wrap only the interactive part, not the whole page.

---

## Platform Services Usage

```typescript
// Tenant context — call once at the top of every Server Action
import { requireTenant } from '@/platform/tenants'
const tenant = await requireTenant() // throws redirect if no session

// RBAC — always check before mutations
import { requireRole } from '@/platform/permissions'
await requireRole(tenant.id, ['owner', 'hr_admin']) // throws 403 if insufficient

// Audit — call after every successful mutation
import { logAudit } from '@/platform/audit'
await logAudit({ tenantId, actor, action, entity, entityId, oldValue, newValue })

// Notifications — call after approval/rejection actions
import { sendNotification } from '@/platform/notifications'
await sendNotification({ tenantId, userId, type: 'leave_approved', payload })
```

---

## TypeScript Conventions for This Project

```typescript
// Monetary values — always centavos, never float
type Centavos = number & { readonly __brand: 'Centavos' }
const amount: Centavos = 69500 as Centavos // ₱695.00

// IDs — branded to prevent mixing
type TenantId = string & { readonly __brand: 'TenantId' }
type EmployeeId = string & { readonly __brand: 'EmployeeId' }

// Database types — always from generated Supabase types
import type { Database } from '@/types/supabase'
type Employee = Database['public']['Tables']['employees']['Row']
type EmployeeInsert = Database['public']['Tables']['employees']['Insert']

// Payroll status — discriminated union, never boolean flags
type PayrollStatus = 'draft' | 'processing' | 'generated' | 'finalized' | 'voided'
```

---

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Server Action file | `{noun}-actions.ts` | `employee-actions.ts` |
| Domain service file | `{noun}-service.ts` | `payroll-service.ts` |
| Repository file | `{noun}-repository.ts` | `leave-repository.ts` |
| Engine folder | kebab-case noun | `worked-hours/` |
| Page component | `page.tsx` | `page.tsx` |
| Shared component | kebab-case | `employee-card.tsx` |
| Server Action function | `{verb}{Noun}Action` | `approveLeaveAction` |
| Service function | `{verb}{Noun}` | `approveLeave` |
| Repository function | `find\|insert\|update\|upsert + descriptor` | `findActiveEmployees` |

---

## What Goes Where — Quick Reference

| If you need to... | Put it in... |
|---|---|
| Render a page | `src/app/.../page.tsx` |
| Handle a form submission | `src/app/.../actions/*.ts` (Server Action) |
| Apply a business rule | `src/domains/{domain}/services/` |
| Do DOLE/payroll math | `src/engines/{engine}/` |
| Query the database | `src/domains/{domain}/repositories/` |
| Check user role | `src/platform/permissions/` |
| Write an audit record | `src/platform/audit/` |
| Send a notification | `src/platform/notifications/` |
| Create a reusable UI block | `src/components/shared/` |
| Create a domain-specific UI | `src/components/{domain}/` |
| Define a type used across files | `src/types/` |
| Create a utility function | `src/lib/` |
