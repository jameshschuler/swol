import { describe, expect, it } from 'vitest'
import { localDateKey } from './dates'
import {
  averageVisitsPerWeek,
  heatmapWeeks,
  recentWorkoutLengths,
  visitDays,
  visitTotals,
  visitsByWeekday,
  visitsPerMonth,
  visitsPerWeek,
  weekStreaks,
  workoutTotals,
} from './stats'
import type { WorkoutSession } from '#/types/api'

const now = new Date(2026, 9, 21, 18)
const day = (month: number, date: number, hour = 9) =>
  new Date(2026, month, date, hour).toISOString()

const session = (overrides: Partial<WorkoutSession>): WorkoutSession => ({
  id: 's',
  kind: 'workout',
  status: 'completed',
  startedAt: day(9, 20),
  pausedAt: null,
  pausedSeconds: 0,
  endedAt: day(9, 20, 10),
  notes: null,
  ...overrides,
})

const keys = (...dates: [number, number][]) =>
  new Set(dates.map(([m, d]) => localDateKey(new Date(2026, m, d))))

describe('visitDays', () => {
  it('leaves out sessions that are still open', () => {
    const days = visitDays(
      [session({ status: 'active', startedAt: day(9, 21), endedAt: null })],
      [],
    )
    expect(days.size).toBe(0)
  })

  it('counts each local day once across sessions and v1 check-ins', () => {
    const days = visitDays(
      [
        session({ startedAt: day(9, 20, 7) }),
        session({ startedAt: day(9, 20, 19) }),
      ],
      [
        { id: 1, checkedInAt: day(9, 20, 12) },
        { id: 2, checkedInAt: day(9, 1) },
      ],
    )
    expect([...days].sort()).toEqual(['2026-10-01', '2026-10-20'])
  })
})

describe('visitTotals', () => {
  it('counts all time, this year and this month', () => {
    const days = new Set(['2025-12-30', ...keys([0, 5], [9, 1], [9, 21])])
    expect(visitTotals(days, now)).toEqual({
      all: 4,
      thisYear: 3,
      thisMonth: 2,
    })
  })
})

describe('weekStreaks', () => {
  it('counts consecutive weeks up to this week', () => {
    const days = keys([9, 1], [9, 6], [9, 13], [9, 20])
    expect(weekStreaks(days, now)).toEqual({ current: 4, longest: 4 })
  })

  it('remembers a longer streak from the past', () => {
    const days = keys([7, 3], [7, 10], [7, 17], [9, 13], [9, 20])
    expect(weekStreaks(days, now)).toEqual({ current: 2, longest: 3 })
  })

  it('keeps the streak alive when only last week has a visit so far', () => {
    expect(weekStreaks(keys([9, 6], [9, 13]), now).current).toBe(2)
  })

  it('drops the current streak after a week with no visits', () => {
    expect(weekStreaks(keys([9, 1], [9, 2]), now)).toEqual({
      current: 0,
      longest: 1,
    })
  })

  it('is zero with no visits', () => {
    expect(weekStreaks(new Set(), now)).toEqual({ current: 0, longest: 0 })
  })
})

describe('visitsPerWeek', () => {
  it('returns the last N weeks oldest first, starting on Sunday', () => {
    const weeks = visitsPerWeek(keys([9, 12], [9, 13], [9, 20]), now, 3)
    expect(weeks.map((w) => [localDateKey(w.start), w.visits])).toEqual([
      ['2026-10-04', 0],
      ['2026-10-11', 2],
      ['2026-10-18', 1],
    ])
  })
})

describe('visitsPerMonth', () => {
  it('returns the last N months oldest first, across a year boundary', () => {
    const days = new Set(['2025-12-31', ...keys([0, 1], [0, 2], [9, 3])])
    const months = visitsPerMonth(days, new Date(2026, 0, 15), 2)
    expect(months.map((m) => [localDateKey(m.start), m.visits])).toEqual([
      ['2025-12-01', 1],
      ['2026-01-01', 2],
    ])
  })
})

describe('visitsByWeekday', () => {
  it('counts visits for each day from Sunday to Saturday', () => {
    expect(visitsByWeekday(keys([9, 18], [9, 19], [9, 20], [9, 13]))).toEqual([
      1, 1, 2, 0, 0, 0, 0,
    ])
  })
})

describe('averageVisitsPerWeek', () => {
  it('averages over complete weeks, leaving out this week', () => {
    const days = keys([8, 22], [8, 29], [9, 6], [9, 7], [9, 13], [9, 20])
    expect(averageVisitsPerWeek(days, now, 4)).toBe(1.25)
  })

  it('only counts weeks since the first visit', () => {
    expect(averageVisitsPerWeek(keys([9, 6], [9, 7], [9, 13]), now, 12)).toBe(
      1.5,
    )
  })

  it('is zero before a full week has passed', () => {
    expect(averageVisitsPerWeek(keys([9, 20]), now, 12)).toBe(0)
    expect(averageVisitsPerWeek(new Set(), now, 12)).toBe(0)
  })
})

describe('workoutTotals', () => {
  it('sums finished workouts only, minus paused time', () => {
    const totals = workoutTotals(
      [
        session({ startedAt: day(9, 1, 9), endedAt: day(9, 1, 10) }),
        session({
          startedAt: day(9, 2, 9),
          endedAt: day(9, 2, 11),
          pausedSeconds: 1800,
        }),
        session({ kind: 'check_in', startedAt: day(9, 3), endedAt: day(9, 3) }),
        session({ status: 'active', endedAt: null }),
      ],
      now.getTime(),
    )
    expect(totals).toEqual({
      count: 2,
      totalSeconds: 9000,
      averageSeconds: 4500,
    })
  })

  it('averages to zero with no workouts', () => {
    expect(workoutTotals([], now.getTime()).averageSeconds).toBe(0)
  })
})

describe('recentWorkoutLengths', () => {
  it('returns the latest workouts oldest first, in minutes', () => {
    const lengths = recentWorkoutLengths(
      [
        session({ startedAt: day(9, 3, 9), endedAt: day(9, 3, 10) }),
        session({ startedAt: day(9, 1, 9), endedAt: day(9, 1, 11) }),
        session({ startedAt: day(9, 2, 9), endedAt: day(9, 2, 9) }),
      ],
      now.getTime(),
      2,
    )
    expect(lengths.map((l) => [localDateKey(l.start), l.minutes])).toEqual([
      ['2026-10-02', 0],
      ['2026-10-03', 60],
    ])
  })
})

describe('heatmapWeeks', () => {
  it('builds whole weeks ending with this week', () => {
    const weeks = heatmapWeeks(now, 2)
    expect(weeks).toHaveLength(2)
    expect(localDateKey(weeks[0][0])).toBe('2026-10-11')
    expect(localDateKey(weeks[1][6])).toBe('2026-10-24')
  })
})
