import { describe, expect, it } from 'vitest'
import { isValidLift } from './lifts'

describe('isValidLift', () => {
  it('accepts a positive weight and whole reps', () => {
    expect(isValidLift('225', '5')).toBe(true)
  })

  it.each([
    ['no weight', '', '5'],
    ['zero weight', '0', '5'],
    ['empty reps', '225', ''],
    ['zero reps', '225', '0'],
    ['fractional reps', '225', '2.5'],
    ['too many reps', '225', '1001'],
    ['rounds to zero', '0.004', '1'],
    ['over the max', '100000', '1'],
    ['rounds over the max', '99999.995', '1'],
  ])('rejects %s', (_, weight, reps) => {
    expect(isValidLift(weight, reps)).toBe(false)
  })
})
