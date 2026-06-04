// Branded types — prevents mixing IDs and monetary values across domains
export type TenantId = string & { readonly __brand: 'TenantId' }
export type EmployeeId = string & { readonly __brand: 'EmployeeId' }
export type UserId = string & { readonly __brand: 'UserId' }
export type PayrollRunId = string & { readonly __brand: 'PayrollRunId' }
export type LeaveRequestId = string & { readonly __brand: 'LeaveRequestId' }
export type OvertimeRequestId = string & { readonly __brand: 'OvertimeRequestId' }

// Monetary values — always stored and computed as integer centavos
// ₱695.00/day = 69500 centavos. NEVER use float for money.
export type Centavos = number & { readonly __brand: 'Centavos' }
