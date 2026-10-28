import { describe, expect, it } from 'vitest'
import { displayTarget, goalProgress, goalsNewlyHit, meetsGoal } from './goals'
import { kgPerLb } from './units'
import type { Goal, Milestone } from '#/types/api'

const goal = (overrides: Partial<Goal> = {}): Goal => ({
  id: 'g',
  exerciseId: 'bench',
  exerciseName: 'Bench Press',
  targetWeight: 100,
  unit: 'kg',
  targetWeightKg: 100,
  targetReps: 3,
  completedAt: null,
  completedMilestoneId: null,
  createdAt: '2026-10-01T12:00:00Z',
  ...overrides,
})

const lift = (
  id: string,
  weightKg: number,
  reps: number,
  day = 1,
  exerciseId = 'bench',
): Milestone => ({
  id,
  exerciseId,
  exerciseName: 'Bench Press',
  weight: weightKg,
  unit: 'kg',
  weightKg,
  reps,
  achievedAt: `2026-10-${String(day).padStart(2, '0')}T12:00:00Z`,
  note: null,
})

describe('displayTarget', () => {
  it('shows the target as set when the unit matches', () => {
    expect(
      displayTarget(
        goal({ targetWeight: 225, unit: 'lb', targetWeightKg: 102.058 }),
        'lb',
      ),
    ).toBe(225)
  })

  it('converts from kilograms when the unit differs', () => {
    expect(
      displayTarget(
        goal({ targetWeight: 225, unit: 'lb', targetWeightKg: 225 * kgPerLb }),
        'kg',
      ),
    ).toBeCloseTo(102.058, 3)
  })
})

describe('meetsGoal', () => {
  it.each([
    ['heavier with enough reps', lift('a', 105, 3), true],
    ['exactly the target', lift('b', 100, 3), true],
    ['heavier but too few reps', lift('c', 120, 2), false],
    ['enough reps but too light', lift('d', 95, 5), false],
    ['another exercise', lift('e', 200, 5, 1, 'squat'), false],
  ])('%s', (_, milestone, expected) => {
    expect(meetsGoal(milestone, goal())).toBe(expected)
  })
})

describe('goalProgress', () => {
  it('rounds progress down so a near miss never shows 100%', () => {
    expect(goalProgress(goal(), [lift('close', 99.6, 3)]).percent).toBe(99)
  })

  it('measures the best lift with enough reps against the target', () => {
    const progress = goalProgress(goal(), [
      lift('light', 80, 5),
      lift('best', 90, 3),
      lift('heavy-single', 110, 1),
    ])
    expect(progress.best?.id).toBe('best')
    expect(progress.percent).toBe(90)
    expect(progress.hitBy).toBeNull()
  })

  it('reports the first lift that met the goal, capped at 100%', () => {
    const progress = goalProgress(goal(), [
      lift('later', 110, 3, 9),
      lift('first', 101, 4, 3),
    ])
    expect(progress.hitBy?.id).toBe('first')
    expect(progress.percent).toBe(100)
  })

  it('is empty with no lifts for the exercise', () => {
    expect(goalProgress(goal(), [lift('x', 200, 5, 1, 'squat')])).toEqual({
      best: null,
      percent: 0,
      hitBy: null,
      completedBy: null,
    })
  })
})

describe('goalProgress completedBy', () => {
  it('finds the lift the goal was completed with', () => {
    const done = goal({
      completedAt: '2026-10-05T12:00:00Z',
      completedMilestoneId: 'pr',
    })
    expect(
      goalProgress(done, [lift('other', 90, 3), lift('pr', 101, 3)]).completedBy
        ?.id,
    ).toBe('pr')
  })

  it('is null when that lift was deleted', () => {
    const done = goal({
      completedAt: '2026-10-05T12:00:00Z',
      completedMilestoneId: 'gone',
    })
    expect(goalProgress(done, [lift('other', 90, 3)]).completedBy).toBeNull()
  })
})

describe('goalsNewlyHit', () => {
  const open = goal({ id: 'open' })
  const done = goal({ id: 'done', completedAt: '2026-10-01T12:00:00Z' })
  const tooHeavy = goal({ id: 'heavy', targetWeightKg: 150 })

  it('finds open goals a new lift meets, skipping completed ones', () => {
    expect(
      goalsNewlyHit(lift('new', 105, 3), [open, done, tooHeavy], []).map(
        (g) => g.id,
      ),
    ).toEqual(['open'])
  })

  it('skips goals an earlier lift already met', () => {
    expect(
      goalsNewlyHit(lift('new', 105, 3), [open], [lift('old', 101, 3)]),
    ).toEqual([])
  })

  it('finds every goal one lift meets', () => {
    const lighter = goal({ id: 'lighter', targetWeightKg: 90, targetReps: 1 })
    expect(
      goalsNewlyHit(lift('new', 105, 3), [open, lighter], []).map((g) => g.id),
    ).toEqual(['open', 'lighter'])
  })
})
