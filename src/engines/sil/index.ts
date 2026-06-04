import type { SilInput, SilResult } from './types'

// Pure function — same inputs always produce same outputs.
// SIL accrual per Labor Code Art. 95: 5 days/year at 1-year service anniversary.
// Balance = derived from ledger, never stored as a denormalized counter.
export function computeSilAccrual(_input: SilInput): SilResult {
  // TODO: implement SIL accrual per Labor Code Art. 95
  // Rules:
  //   - Employee must have >= 1 year of service to be eligible
  //   - 5 days SIL per year
  //   - Pro-rated monthly (default): (months_worked / 12) * 5
  //   - Exempt: managerial/field personnel, companies with <10 workers (tenant config)
  throw new Error('SilEngine not yet implemented')
}
