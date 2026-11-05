import { describe, expect, it } from 'vitest'
import {
  hasStarted,
  missingLifts,
  powerliftingTotal,
  totalHistory,
  weightliftingTotal,
} from './totals'
import { kgPerLb } from './units'
import type { Milestone } from '#/types/api'

const sbd = powerliftingTotal.lifts

const single = (
  exerciseName: string,
  weight: number,
  achievedAt: string,
  overrides: Partial<Milestone> = {},
): Milestone => ({
  id: `${exerciseName}-${weight}-${achievedAt}`,
  exerciseId: exerciseName,
  exerciseName,
  weight,
  unit: 'lb',
  weightKg: weight * kgPerLb,
  reps: 1,
  achievedAt,
  rpe: null,
  note: null,
  ...overrides,
})

const meet = [
  single('Squat', 405, '2026-03-14T15:00:00Z'),
  single('Bench Press', 285, '2026-03-14T16:00:00Z'),
  single('Deadlift', 500, '2026-03-14T17:00:00Z'),
]

describe('totalHistory', () => {
  it('returns nothing for no milestones', () => {
    expect(totalHistory([], sbd, 'lb')).toEqual([])
  })

  it('returns nothing until every lift has a single', () => {
    expect(totalHistory(meet.slice(0, 2), sbd, 'lb')).toEqual([])
  })

  it('adds the best single of each lift', () => {
    const [point] = totalHistory(meet, sbd, 'lb')
    expect(point.total).toBe(1190)
    expect(point.bests.map((m) => m.exerciseName)).toEqual(sbd)
  })

  it('ignores sets of more than one rep', () => {
    const triple = single('Squat', 455, '2026-04-01T12:00:00Z', { reps: 3 })
    expect(totalHistory([...meet, triple], sbd, 'lb')).toHaveLength(1)
  })

  it('adds a point each time a best single goes up', () => {
    const history = totalHistory(
      [...meet, single('Deadlift', 525, '2026-05-02T12:00:00Z')],
      sbd,
      'lb',
    )
    expect(history.map((point) => point.total)).toEqual([1190, 1215])
    expect(history[1].achievedAt).toBe('2026-05-02T12:00:00Z')
  })

  it('skips singles that only match the best', () => {
    const repeat = single('Bench Press', 285, '2026-05-02T12:00:00Z')
    expect(totalHistory([...meet, repeat], sbd, 'lb')).toHaveLength(1)
  })

  it('skips singles lighter than the best', () => {
    const lighter = single('Bench Press', 275, '2026-05-02T12:00:00Z')
    expect(totalHistory([...meet, lighter], sbd, 'lb')).toHaveLength(1)
  })

  it('merges records set on the same day into one point', () => {
    const history = totalHistory(
      [
        ...meet,
        single('Squat', 425, '2026-03-14T18:00:00Z'),
        single('Bench Press', 300, '2026-03-14T18:30:00Z'),
      ],
      sbd,
      'lb',
    )
    expect(history).toHaveLength(1)
    expect(history[0].total).toBe(1225)
  })

  it('sorts milestones by date before walking them', () => {
    const history = totalHistory([...meet].reverse(), sbd, 'lb')
    expect(history).toHaveLength(1)
    expect(history[0].total).toBe(1190)
  })

  it('converts lifts logged in another unit', () => {
    const kgBench = single('Bench Press', 130, '2026-03-14T16:00:00Z', {
      unit: 'kg',
      weightKg: 130,
    })
    const [point] = totalHistory([meet[0], kgBench, meet[2]], sbd, 'lb')
    expect(point.total).toBeCloseTo(905 + 130 / kgPerLb, 6)
  })

  it('converts to kilograms when that is the display unit', () => {
    const [point] = totalHistory(meet, sbd, 'kg')
    expect(point.total).toBeCloseTo(1190 * kgPerLb, 6)
  })

  it('matches lift names regardless of case', () => {
    const lower = meet.map((m) => ({
      ...m,
      exerciseName: m.exerciseName.toLowerCase(),
    }))
    expect(totalHistory(lower, sbd, 'lb')).toHaveLength(1)
  })

  it('totals Olympic lifts', () => {
    const [point] = totalHistory(
      [
        single('Snatch', 100, '2026-06-01T12:00:00Z', {
          unit: 'kg',
          weightKg: 100,
        }),
        single('Clean and Jerk', 125, '2026-06-01T12:30:00Z', {
          unit: 'kg',
          weightKg: 125,
        }),
      ],
      weightliftingTotal.lifts,
      'kg',
    )
    expect(point.total).toBe(225)
  })
})

describe('missingLifts', () => {
  it('lists every lift when there are no milestones', () => {
    expect(missingLifts([], sbd)).toEqual(sbd)
  })

  it('lists lifts without a single', () => {
    const triple = single('Deadlift', 455, '2026-04-01T12:00:00Z', { reps: 3 })
    expect(missingLifts([meet[0], triple], sbd)).toEqual([
      'Bench Press',
      'Deadlift',
    ])
  })

  it('is empty when every lift has a single', () => {
    expect(missingLifts(meet, sbd)).toEqual([])
  })
})

describe('hasStarted', () => {
  it('is false with no milestones for the lifts', () => {
    expect(hasStarted(meet, weightliftingTotal.lifts)).toBe(false)
  })

  it('is true with any milestone for one of the lifts', () => {
    const snatchTriple = single('Snatch', 60, '2026-06-01T12:00:00Z', {
      reps: 3,
    })
    expect(hasStarted([snatchTriple], weightliftingTotal.lifts)).toBe(true)
  })
})
