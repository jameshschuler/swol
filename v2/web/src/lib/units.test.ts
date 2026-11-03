import { describe, expect, it } from 'vitest'
import { formatWeight, fromKg, kgPerLb, roundWeight } from './units'

describe('fromKg', () => {
  it('keeps kilograms as they are', () => {
    expect(fromKg(100, 'kg')).toBe(100)
  })

  it('converts kilograms to pounds', () => {
    expect(fromKg(225 * kgPerLb, 'lb')).toBeCloseTo(225)
  })
})

describe('formatWeight', () => {
  it.each([
    [225, 'lb', '225 lb'],
    [102.058, 'kg', '102.1 kg'],
    [60.04, 'kg', '60 kg'],
    [2.5, 'kg', '2.5 kg'],
  ] as const)('formats %d %s as %s', (value, unit, expected) => {
    expect(formatWeight(value, unit)).toBe(expected)
  })
})

describe('roundWeight', () => {
  it.each([
    [225, 225],
    [1190.0000001, 1190],
    [102.058, 102.1],
  ])('rounds %d to %d', (value, expected) => {
    expect(roundWeight(value)).toBe(expected)
  })
})
