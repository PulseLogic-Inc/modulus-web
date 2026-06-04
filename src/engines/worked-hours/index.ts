import type { WorkedHoursInput, WorkedHoursResult } from './types'

// Pure function — same inputs always produce same outputs.
// No DB calls. No side effects. No imports from src/app, src/domains, or src/platform.
// Build this engine fully before any UI consumes it (Sprint 0 priority).
export function calculateWorkedHours(_input: WorkedHoursInput): WorkedHoursResult {
  // TODO: implement DOLE-compliant worked hours calculation
  // DOLE rules to implement:
  //   - Regular OT: worked > 8h on a regular day → excess at 1.25×
  //   - Rest day: all hours at 1.30×; OT at 1.69×
  //   - Special non-working: all hours at 1.30×; OT at 1.69×
  //   - Regular holiday: all hours at 2.00×; OT at 2.60×
  //   - Night differential: +10% for hours between nightDiffStart and nightDiffEnd
  //   - Late: clock-in after (shiftStart + gracePeriod)
  //   - Undertime: clock-out before shiftEnd
  throw new Error('WorkedHoursEngine not yet implemented')
}
