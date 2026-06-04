import { describe, it, expect } from 'vitest'
import { computePayroll } from './index'

describe('computePayroll', () => {
  it('is a pure function placeholder', () => {
    expect(() => computePayroll({} as never)).toThrow('not yet implemented')
    // TODO: replace with full DOLE scenario tests once engine is implemented
  })
})
