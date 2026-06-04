# Skill: Philippine Fiscal & ERP Compliance Rules

This skill enforces strict adherence to Philippine business practices and BIR regulations within the scope of the **Modulus MVP (Phase 0–1): HR, Payroll, Timekeeping, Leave, Overtime, and Government Remittance modules**.

> **Scope note:** VAT computation, BIR 1601-E Expanded Withholding Tax, and OR/SI serial tracking belong to the **Finance & Accounting module (Phase 2+)**. Do not apply those rules to HR or Payroll work.

---

## 🇵🇭 Currency & Locale Formatting

Always format monetary values using the Philippine Peso symbol (`₱`) with `en-PH` locale:

```typescript
new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value / 100)
// Note: all monetary values in the DB are stored as centavos (BIGINT).
// Divide by 100 before formatting for display.
```

Display rules:
- Always show 2 decimal places: `₱1,234.50`
- Never display raw centavo integers to the user
- Currency is locked to PHP at MVP — no multi-currency support yet

---

## 🪪 Tax Identification Number (TIN)

Philippine TIN formats:
- **Individual (employee):** `NNN-NNN-NNN-000` — 9-digit base + `000` branch suffix
- **Business (employer/tenant):** `NNN-NNN-NNN-NNNNN` — 9-digit base + up to 5-digit branch code

Validation pattern (TypeScript):
```typescript
// Individual TIN
/^\d{3}-\d{3}-\d{3}-\d{3,5}$/
```

Rules:
- TIN is required on payslips (employee TIN + tenant TIN) per BIR compliance
- TIN is required on BIR Alphalist (RPT-007) and Form 2316 (RPT-008)
- Statutory IDs (TIN, SSS, PhilHealth, Pag-IBIG) are validated at payroll generation time, not at employee creation

---

## 📊 Payroll Withholding Tax — BIR 1601-C (Compensation)

Modulus payroll uses **BIR Form 1601-C** (Withholding Tax on Compensation) — not 1601-E.

WHT is computed per the **TRAIN Law (RA 10963)** brackets stored in `bir_tables` with the correct `cadence` value for the tenant's payroll frequency.

Bracket lookup logic:
```typescript
// Select the active bracket for the employee's taxable compensation and payroll cadence
// Engine reads from bir_tables WHERE cadence = tenant.payroll_cadence
//   AND effective_from <= period.payday
//   AND (effective_to IS NULL OR effective_to >= period.payday)
//   AND bracket_from <= taxable_compensation
//   AND (bracket_to IS NULL OR bracket_to >= taxable_compensation)

// WHT formula:
// tax = base_tax + ((taxable_compensation - bracket_from) * rate)
// All values computed in centavos (BIGINT). No floating point.
```

Cadence-aware: BIR publishes separate WHT tables for daily, weekly, semi-monthly, and monthly payroll. Always use the bracket matching the tenant's `payroll_cadence` from `tenants.payroll_cadence`.

Non-taxable ceiling: 13th month pay and other benefits are non-taxable up to **₱90,000/year** per TRAIN Law. Tag the non-taxable portion with reason code `THIRTEEN_MONTH_NONTAXABLE`.

---

## 🔒 Immutable Ledger Constraints (BIR CAS Alignment)

These rules apply to all finalized payroll records and audit logs in Modulus:

*   **No destructive mutations on finalized records.** Never execute `UPDATE` or `DELETE` on finalized payroll runs, payroll items, payslips, leave ledger entries, or audit logs. Corrections must use:
    - Payroll: Reopen flow (`finalize-payroll` → `reopen-payroll`) which voids payslips and creates offsetting entries
    - Leave: New ledger entries (append-only `leave_ledger`)
    - All mutations: New `audit_logs` entry recording `actor`, `old_value`, `new_value`

*   **Audit trail fields.** Every business table mutation must record:
    ```
    actor      — auth.users UUID of the person performing the action
    timestamp  — exact TIMESTAMPTZ of the action (from audit_logs)
    action     — verb (CREATE, UPDATE, APPROVE, FINALIZE, REOPEN, VOID, etc.)
    old_value  — JSONB snapshot before change
    new_value  — JSONB snapshot after change
    ```
    Use the centralized audit service at `src/platform/audit/` — never implement inline per feature.

*   **Soft deletes only.** All business tables use `deleted_at TIMESTAMPTZ NULL`. Never hard-delete. Queries must always filter `WHERE deleted_at IS NULL`.

---

## 📋 Government Statutory Tables

Rates are stored in versioned tables (`effective_from` / `effective_to`). The payroll engine always selects the version active on the period's payday — never hardcode rates.

| Table | Agency | 2026 Rate |
|---|---|---|
| `sss_tables` | SSS | Per MSC bracket (employee + employer share) |
| `philhealth_tables` | PhilHealth | 5% of monthly basic salary; ₱100k MSC cap |
| `pagibig_tables` | Pag-IBIG | 1–2% employee; 2% employer |
| `bir_tables` | BIR | TRAIN Law brackets per cadence |

Rules:
- Never overwrite an existing row — insert a new version with updated `effective_from`
- When government updates rates, Modulus inserts new rows centrally; all tenants get them automatically
- PhilHealth contribution is split 50/50 employee/employer: `employee = monthly_basic * 0.025`, `employer = monthly_basic * 0.025`, floored at ₱250 each, capped at ₱2,500 each (2026)
- Pag-IBIG: deducted once per month regardless of payroll cadence (see `payroll_cadence` deduction timing in CLAUDE.md)

---

## 🗓️ Compliance Deadlines (MVP Scope)

| Deadline | Obligation | Reference |
|---|---|---|
| Monthly (last day + 10 days) | SSS R3 remittance | RPT-002 |
| Monthly | PhilHealth RF-1 remittance | RPT-003 |
| Monthly | Pag-IBIG MCRF remittance | RPT-004 |
| Dec 24, 2026 | 13th Month Pay release | PAY-024, PD 851 |
| Nov 30, 2026 | Year-end SIL cash conversion | LV-011, Labor Code Art. 95 |
| Jan 31, 2027 | BIR Alphalist (Form 1604-C) | RPT-007 |
| Jan 31, 2027 | BIR Form 2316 bulk issuance | RPT-008 |

---

## ⏳ Deferred to Finance Module (Phase 2+)

The following are **not in scope** for HR/Payroll development:
- VAT computation (12% standard rate, VAT-inclusive/exclusive math)
- BIR 1601-E Expanded Withholding Tax (goods 1%, services 2%, professional fees 5–10%)
- Official Receipt (OR) and Sales Invoice (SI) sequential serial numbering
- BIR CAS journal entry structure for financial transactions
- Senior Citizen / PWD discount computation
