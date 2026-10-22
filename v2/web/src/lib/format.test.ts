import { describe, expect, it } from 'vitest'
import {
  formatClock,
  formatDuration,
  formatHours,
  formatWeekdayName,
  formatWeeks,
} from './format'

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

describe('formatHours', () => {
  it.each([
    [0, '0 h'],
    [5400, '1.5 h'],
    [45000, '12.5 h'],
    [3601, '1 h'],
  ])('formats %i seconds as %s', (seconds, expected) => {
    expect(formatHours(seconds)).toBe(expected)
  })
})

describe('formatWeeks', () => {
  it.each([
    [0, '0 weeks'],
    [1, '1 week'],
    [26, '26 weeks'],
  ])('formats %i as %s', (count, expected) => {
    expect(formatWeeks(count)).toBe(expected)
  })
})

describe('formatWeekdayName', () => {
  it('starts the week on Sunday', () => {
    expect(formatWeekdayName(0)).toBe(
      new Date(2026, 0, 4).toLocaleDateString(undefined, { weekday: 'short' }),
    )
  })
})
