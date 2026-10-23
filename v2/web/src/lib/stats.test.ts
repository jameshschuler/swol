import { describe, expect, it } from 'vitest'
import { localDateKey, msPerWeek } from './dates'
import {
  firstVisit,
  lifetimeVisitsPerWeek,
  visitYears,
  yearStats,
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
  it('counts all time and this month', () => {
    const days = new Set(['2025-12-30', ...keys([0, 5], [9, 1], [9, 21])])
    expect(visitTotals(days, now)).toEqual({ all: 4, thisMonth: 2 })
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

describe('firstVisit', () => {
  it('finds the earliest visit day', () => {
    expect(firstVisit(new Set(['2026-10-01', '2023-07-14']))).toEqual(
      new Date(2023, 6, 14),
    )
    expect(firstVisit(new Set())).toBeNull()
  })
})

describe('lifetimeVisitsPerWeek', () => {
  it('averages from the first visit through today', () => {
    const start = new Date(2026, 8, 30)
    const days = new Set(
      Array.from({ length: 6 }, (_, i) =>
        localDateKey(new Date(2026, 8, 30 + i * 3)),
      ),
    )
    const endOfToday = new Date(2026, 9, 22)
    const weeks = (endOfToday.getTime() - start.getTime()) / msPerWeek
    expect(lifetimeVisitsPerWeek(days, now)).toBeCloseTo(6 / weeks)
  })

  it('treats a brand-new account as at least one week', () => {
    expect(lifetimeVisitsPerWeek(keys([9, 21]), now)).toBe(1)
  })

  it('is zero with no visits', () => {
    expect(lifetimeVisitsPerWeek(new Set(), now)).toBe(0)
  })
})

describe('visitYears', () => {
  it('lists years from this one back to the first visit', () => {
    expect(visitYears(new Set(['2023-07-14']), now)).toEqual([
      2026, 2025, 2024, 2023,
    ])
  })

  it('still lists this year if a visit is dated in the future', () => {
    expect(visitYears(new Set(['2027-01-01']), now)).toEqual([2026])
  })

  it('lists only this year with no visits', () => {
    expect(visitYears(new Set(), now)).toEqual([2026])
  })
})

describe('yearStats', () => {
  const days = new Set([
    '2023-07-14',
    '2024-01-10',
    '2024-06-01',
    '2024-12-31',
    '2026-10-20',
  ])

  it('averages a full past year over the whole year', () => {
    const stats = yearStats(days, 2024, now)
    expect(stats.visits).toBe(3)
    expect(stats.visitsPerWeek).toBeCloseTo(3 / (366 / 7))
  })

  it('starts the first year at the first visit', () => {
    const first = new Date(2023, 6, 14)
    const weeks = (new Date(2024, 0, 1).getTime() - first.getTime()) / msPerWeek
    expect(yearStats(days, 2023, now).visitsPerWeek).toBeCloseTo(1 / weeks)
  })

  it('stops the current year at today', () => {
    const weeks =
      (new Date(2026, 9, 22).getTime() - new Date(2026, 0, 1).getTime()) /
      msPerWeek
    expect(yearStats(days, 2026, now).visitsPerWeek).toBeCloseTo(1 / weeks)
  })

  it('is zero for a year before the first visit', () => {
    expect(yearStats(days, 2022, now)).toEqual({ visits: 0, visitsPerWeek: 0 })
  })
})
