// HR domain type exports
// Domain-specific types live here; shared infrastructure types live in src/types/

export type EmploymentType = 'regular' | 'probationary' | 'project_based' | 'casual' | 'fixed_term' | 'contractual'

export type EmployeeStatus =
  | 'active'
  | 'probationary'
  | 'on_leave'
  | 'awol'
  | 'suspended'
  | 'terminated'
  | 'resigned'
  | 'inactive'

export type CompensationType = 'daily' | 'monthly'
