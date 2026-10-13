import { describe, expect, it } from 'vitest'
import { formatClock, formatDuration } from './format'

describe('formatClock', () => {
  it.each([
    [0, '0:00'],
    [59, '0:59'],
    [61, '1:01'],
    [3599, '59:59'],
    [3600, '1:00:00'],
    [3725, '1:02:05'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatClock(seconds)).toBe(expected)
  })
})

describe('formatDuration', () => {
  it.each([
    [0, '0m 0s'],
    [42, '0m 42s'],
    [60, '1m 0s'],
    [3599, '59m 59s'],
    [3600, '1h 0m 0s'],
    [5465, '1h 31m 5s'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatDuration(seconds)).toBe(expected)
  })
})
