import { describe, expect, it } from 'vitest'
import { groupByDay, localDateKey, monthGrid, timeForDate } from './dates'

describe('localDateKey', () => {
  it('formats the local date with zero padding', () => {
    expect(localDateKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05')
  })
})

describe('monthGrid', () => {
  it('fills whole weeks starting on Sunday', () => {
    const days = monthGrid(2026, 9)
    expect(days).toHaveLength(35)
    expect(localDateKey(days[0])).toBe('2026-09-27')
    expect(localDateKey(days[34])).toBe('2026-10-31')
  })

  it('adds a sixth week when the month needs it', () => {
    const days = monthGrid(2026, 7)
    expect(days).toHaveLength(42)
    expect(localDateKey(days[0])).toBe('2026-07-26')
    expect(localDateKey(days[41])).toBe('2026-09-05')
  })

  it('needs only four weeks for a February that starts on Sunday', () => {
    expect(monthGrid(2026, 1)).toHaveLength(28)
  })
})

describe('groupByDay', () => {
  it('groups items by their local date', () => {
    const items = [
      { at: new Date(2026, 9, 1, 8).toISOString() },
      { at: new Date(2026, 9, 1, 20).toISOString() },
      { at: new Date(2026, 9, 2, 9).toISOString() },
    ]
    const days = groupByDay(items, (item) => item.at)
    expect(days.get('2026-10-01')).toHaveLength(2)
    expect(days.get('2026-10-02')).toHaveLength(1)
    expect(days.has('2026-10-03')).toBe(false)
  })
})

describe('timeForDate', () => {
  const now = new Date(2026, 9, 13, 18, 30)

  it('uses the current time when the date is today', () => {
    expect(timeForDate('2026-10-13', now)).toBe(now.toISOString())
  })

  it('uses local noon for an earlier date', () => {
    expect(timeForDate('2026-10-01', now)).toBe(
      new Date(2026, 9, 1, 12).toISOString(),
    )
  })
})
