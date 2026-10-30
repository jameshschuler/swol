import { describe, expect, it } from 'vitest'
import {
  closestGoals,
  displayTarget,
  formatGoalTarget,
  goalLadders,
  goalProgress,
  goalStatus,
  goalsNewlyHit,
  meetsGoal,
} from './goals'
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
  it('measures the best lift with enough reps against the target', () => {
    const progress = goalProgress(goal(), [
      lift('light', 80, 5),
      lift('best', 90, 3),
      lift('heavy-single', 110, 1),
    ])
    expect(progress.best?.id).toBe('best')
    expect(progress.remainingKg).toBe(10)
    expect(progress.hitBy).toBeNull()
  })

  it('reports the first lift that met the goal, with nothing left to go', () => {
    const progress = goalProgress(goal(), [
      lift('later', 110, 3, 9),
      lift('first', 101, 4, 3),
    ])
    expect(progress.hitBy?.id).toBe('first')
    expect(progress.remainingKg).toBe(0)
  })

  it('is empty with no lifts for the exercise', () => {
    expect(goalProgress(goal(), [lift('x', 200, 5, 1, 'squat')])).toEqual({
      best: null,
      remainingKg: 100,
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

describe('goalLadders', () => {
  it('groups goals by exercise, sorted by name', () => {
    const ladders = goalLadders([
      goal({ id: 's', exerciseId: 'squat', exerciseName: 'Squat' }),
      goal({ id: 'b', exerciseId: 'bench', exerciseName: 'Bench Press' }),
    ])
    expect(ladders.map((l) => l.exerciseName)).toEqual(['Bench Press', 'Squat'])
  })

  it('puts the hardest target first by estimated one-rep max', () => {
    const [squat] = goalLadders([
      goal({ id: '405x1', targetWeightKg: 184, targetReps: 1 }),
      goal({ id: '365x8', targetWeightKg: 165, targetReps: 8 }),
      goal({ id: '455x1', targetWeightKg: 206, targetReps: 1 }),
    ])
    expect(squat.goals.map((g) => g.id)).toEqual(['365x8', '455x1', '405x1'])
  })

  it('is empty with no goals', () => {
    expect(goalLadders([])).toEqual([])
  })
})

describe('formatGoalTarget', () => {
  it('shows the target weight in the display unit and reps', () => {
    expect(
      formatGoalTarget(
        goal({
          targetWeight: 405,
          unit: 'lb',
          targetWeightKg: 183.7,
          targetReps: 1,
        }),
        'lb',
      ),
    ).toBe('405 lb × 1')
  })
})

describe('goalStatus', () => {
  it('shows the weight left to lift', () => {
    const target = goal({ targetWeightKg: 100 })
    expect(
      goalStatus(target, goalProgress(target, [lift('a', 90, 3)]), 'kg'),
    ).toBe('10 kg to go')
  })

  it('shows nothing once a lift meets the goal', () => {
    const target = goal()
    expect(
      goalStatus(target, goalProgress(target, [lift('a', 100, 3)]), 'kg'),
    ).toBeNull()
  })

  it.each([
    [1, 'No lifts yet'],
    [5, 'No 5-rep lifts yet'],
  ])('says when there are no %i-rep lifts', (targetReps, text) => {
    const target = goal({ targetReps })
    expect(goalStatus(target, goalProgress(target, []), 'kg')).toBe(text)
  })
})

describe('closestGoals', () => {
  const ids = (goals: Goal[], milestones: Milestone[], limit = 5) =>
    closestGoals(goals, milestones, limit).map((closest) => closest.goal.id)

  it('puts the goals with the least weight to go first', () => {
    const goals = [
      goal({ id: 'far', targetWeightKg: 140 }),
      goal({ id: 'hit', targetWeightKg: 90 }),
      goal({ id: 'near', targetWeightKg: 110 }),
    ]
    expect(ids(goals, [lift('a', 100, 3)])).toEqual(['hit', 'near', 'far'])
  })

  it('puts goals with no lifts last', () => {
    const goals = [
      goal({ id: 'untried', exerciseId: 'squat', targetWeightKg: 20 }),
      goal({ id: 'tried', targetWeightKg: 200 }),
    ]
    expect(ids(goals, [lift('a', 100, 3)])).toEqual(['tried', 'untried'])
  })

  it('keeps goals with no lifts in their original order', () => {
    const goals = ['a', 'b', 'c'].map((id) =>
      goal({ id, exerciseId: `untried-${id}` }),
    )
    expect(ids([goal({ id: 'tried' }), ...goals], [lift('l', 90, 3)])).toEqual([
      'tried',
      'a',
      'b',
      'c',
    ])
  })

  it('leaves out completed goals', () => {
    const goals = [
      goal({ id: 'done', completedAt: '2026-10-02T12:00:00Z' }),
      goal({ id: 'open' }),
    ]
    expect(ids(goals, [])).toEqual(['open'])
  })

  it('returns at most the limit', () => {
    const goals = ['a', 'b', 'c'].map((id) => goal({ id }))
    expect(ids(goals, [], 2)).toEqual(['a', 'b'])
  })

  it('returns nothing when there are no goals', () => {
    expect(ids([], [])).toEqual([])
  })
})
