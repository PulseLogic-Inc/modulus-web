import type { PayrollInput, PayrollResult } from './types'

// Pure function — same inputs always produce same outputs.
// No DB calls. No side effects. All monetary values in centavos (BIGINT).
// Floating-point arithmetic FORBIDDEN. Use integer math throughout.
// Build this engine fully before any UI consumes it (Sprint 0 priority).
export function computePayroll(_input: PayrollInput): PayrollResult {
  // TODO: implement DOLE/BIR-compliant payroll computation
  // Covers: basic pay, OT pay per type, night diff, SSS/PhilHealth/Pag-IBIG, WHT
  // WHT uses BIR 1601-C TRAIN Law brackets per payroll cadence
  // Every line item must carry a reason code for audit replay
  throw new Error('PayrollEngine not yet implemented')
}
