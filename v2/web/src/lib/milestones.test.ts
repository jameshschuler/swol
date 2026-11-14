import { describe, expect, it } from 'vitest'
import {
  displayWeight,
  draftFromMilestone,
  draftToMilestone,
  emptyDraft,
  formatLift,
  formatLiftWithRpe,
  groupByBaseExercise,
  groupByExercise,
  isCompleteMilestone,
  isLift,
  personalRecords,
} from './milestones'
import { kgPerLb } from './units'
import type { Milestone } from '#/types/api'

const milestone = (overrides: Partial<Milestone>): Milestone => ({
  id: 'm',
  exerciseId: 'squat',
  exerciseName: 'Squat',
  weight: 100,
  unit: 'kg',
  weightKg: 100,
  reps: 1,
  achievedAt: '2026-10-01T12:00:00Z',
  baseExerciseId: null,
  baseExerciseName: null,
  rpe: null,
  note: null,
  ...overrides,
})

describe('displayWeight', () => {
  it('shows the weight as logged when the unit matches', () => {
    const logged = milestone({ weight: 225, unit: 'lb', weightKg: 102.058 })
    expect(displayWeight(logged, 'lb')).toBe(225)
  })

  it('converts from kilograms when the unit differs', () => {
    const logged = milestone({
      weight: 225,
      unit: 'lb',
      weightKg: 225 * kgPerLb,
    })
    expect(displayWeight(logged, 'kg')).toBeCloseTo(102.058, 3)
  })
})

describe('groupByExercise', () => {
  it('groups by exercise, sorted by name, keeping the given order inside', () => {
    const groups = groupByExercise([
      milestone({ id: 's2', achievedAt: '2026-10-02T12:00:00Z' }),
      milestone({ id: 'b1', exerciseId: 'bench', exerciseName: 'Bench Press' }),
      milestone({ id: 's1' }),
    ])
    expect(groups.map((g) => g.exerciseName)).toEqual(['Bench Press', 'Squat'])
    expect(groups[1].milestones.map((m) => m.id)).toEqual(['s2', 's1'])
  })

  it('picks the heaviest lift as best, comparing in kilograms', () => {
    const [squat] = groupByExercise([
      milestone({ id: 'kg', weight: 100, unit: 'kg', weightKg: 100 }),
      milestone({ id: 'lb', weight: 225, unit: 'lb', weightKg: 102.058 }),
    ])
    expect(squat.best.id).toBe('lb')
  })

  it('breaks a tie with the earlier lift', () => {
    const [squat] = groupByExercise([
      milestone({ id: 'later', achievedAt: '2026-10-05T12:00:00Z' }),
      milestone({ id: 'first', achievedAt: '2026-10-01T12:00:00Z' }),
    ])
    expect(squat.best.id).toBe('first')
  })

  it('is empty when there are no milestones', () => {
    expect(groupByExercise([])).toEqual([])
  })
})

describe('personalRecords', () => {
  const lift = (id: string, weightKg: number, reps: number, day = 1) =>
    milestone({
      id,
      weight: weightKg,
      weightKg,
      reps,
      achievedAt: `2026-10-${String(day).padStart(2, '0')}T12:00:00Z`,
    })

  it('marks the heaviest lift as the weight PR and unbeaten lifts as rep PRs', () => {
    const heavy = lift('225x1', 102, 1)
    const all = [
      heavy,
      lift('205x5', 93, 5),
      lift('185x10', 84, 10),
      lift('185x5', 84, 5),
    ]
    expect(Object.fromEntries(personalRecords(all, heavy))).toEqual({
      '225x1': 'weight',
      '205x5': 'reps',
      '185x10': 'reps',
    })
  })

  it('gives a repeated lift the PR only the first time', () => {
    const first = lift('first', 100, 5, 1)
    const again = lift('again', 100, 5, 8)
    expect(Object.fromEntries(personalRecords([again, first], first))).toEqual({
      first: 'weight',
    })
  })

  it('does not count a lift beaten on reps at the same weight', () => {
    const triple = lift('100x3', 100, 3)
    const single = lift('100x1', 100, 1)
    expect(personalRecords([triple, single], triple).has('100x1')).toBe(false)
  })

  it('wires records into each exercise group', () => {
    const [squat] = groupByExercise([
      lift('heavy', 140, 1),
      lift('volume', 120, 8),
    ])
    expect(squat.records.get('heavy')).toBe('weight')
    expect(squat.records.get('volume')).toBe('reps')
  })

  it('makes more reps at the same top weight the weight PR', () => {
    const single = lift('225x1', 102, 1, 1)
    const triple = lift('225x3', 102, 3, 10)
    const [squat] = groupByExercise([triple, single])
    expect(squat.best.id).toBe('225x3')
    expect(Object.fromEntries(squat.records)).toEqual({ '225x3': 'weight' })
  })

  it('gives only one of two identical lifts on the same day a PR', () => {
    const a = lift('a', 60, 10, 5)
    const b = lift('b', 60, 10, 5)
    const [squat] = groupByExercise([a, b, lift('heavy', 100, 1)])
    expect(squat.records.has('a')).not.toBe(squat.records.has('b'))
  })
})

describe('isCompleteMilestone', () => {
  const form = {
    ...emptyDraft('lb', new Date(2026, 9, 21)),
    exerciseId: 'squat',
    weight: '225',
    reps: '5',
  }

  it('accepts a complete form', () => {
    expect(isCompleteMilestone(form)).toBe(true)
  })

  it.each([
    ['no exercise', { exerciseId: '' }],
    ['no weight', { weight: '' }],
    ['zero weight', { weight: '0' }],
    ['empty reps', { reps: '' }],
    ['zero reps', { reps: '0' }],
    ['fractional reps', { reps: '2.5' }],
    ['too many reps', { reps: '1001' }],
    ['no date', { date: '' }],
  ])('rejects %s', (_, change) => {
    expect(isCompleteMilestone({ ...form, ...change })).toBe(false)
  })
})

describe('formatLift', () => {
  it('shows weight in the display unit and reps', () => {
    expect(
      formatLift(
        milestone({ weight: 225, unit: 'lb', weightKg: 102.058, reps: 3 }),
        'lb',
      ),
    ).toBe('225 lb × 3')
  })

  it('leaves out the RPE', () => {
    expect(formatLift(milestone({ rpe: 9 }), 'kg')).toBe('100 kg × 1')
  })
})

describe('formatLiftWithRpe', () => {
  it('adds the RPE when there is one', () => {
    expect(
      formatLiftWithRpe(
        milestone({ weight: 405, unit: 'lb', weightKg: 183.705, rpe: 8.5 }),
        'lb',
      ),
    ).toBe('405 lb × 1 @ RPE 8.5')
  })

  it('matches formatLift without an RPE', () => {
    expect(formatLiftWithRpe(milestone({}), 'kg')).toBe('100 kg × 1')
  })
})

describe('emptyDraft', () => {
  it('starts with a single today in the given unit', () => {
    expect(emptyDraft('kg', new Date(2026, 10, 4, 9))).toEqual({
      exerciseId: '',
      weight: '',
      unit: 'kg',
      reps: '1',
      rpe: null,
      date: '2026-11-04',
      note: '',
    })
  })
})

describe('draftFromMilestone', () => {
  it('fills the form from a logged milestone', () => {
    const logged = milestone({
      weight: 405,
      unit: 'lb',
      reps: 2,
      rpe: 9,
      achievedAt: new Date(2026, 9, 1, 18).toISOString(),
      note: 'Belt and sleeves',
    })
    expect(draftFromMilestone(logged)).toEqual({
      exerciseId: 'squat',
      weight: '405',
      unit: 'lb',
      reps: '2',
      rpe: 9,
      date: '2026-10-01',
      note: 'Belt and sleeves',
    })
  })

  it('leaves the note empty when there is none', () => {
    expect(draftFromMilestone(milestone({})).note).toBe('')
  })
})

describe('draftToMilestone', () => {
  const now = new Date(2026, 10, 4, 9)

  it('turns form text into numbers', () => {
    const draft = {
      ...emptyDraft('lb', now),
      exerciseId: 'squat',
      weight: '405.5',
      reps: '3',
      rpe: 8,
      note: 'Belt',
    }
    expect(draftToMilestone(draft, now)).toEqual({
      exerciseId: 'squat',
      weight: 405.5,
      unit: 'lb',
      reps: 3,
      rpe: 8,
      achievedAt: now.toISOString(),
      note: 'Belt',
    })
  })

  it('uses midday for a past date', () => {
    const draft = { ...emptyDraft('lb', now), date: '2026-10-01' }
    expect(draftToMilestone(draft, now).achievedAt).toBe(
      new Date(2026, 9, 1, 12).toISOString(),
    )
  })

  it('keeps the original time when an edit keeps the date', () => {
    const original = milestone({
      achievedAt: new Date(2026, 9, 1, 18, 30).toISOString(),
    })
    const draft = { ...draftFromMilestone(original), weight: '110' }
    expect(draftToMilestone(draft, now, original).achievedAt).toBe(
      original.achievedAt,
    )
  })

  it('moves to the new date when an edit changes it', () => {
    const original = milestone({
      achievedAt: new Date(2026, 9, 1, 18, 30).toISOString(),
    })
    const draft = { ...draftFromMilestone(original), date: '2026-10-03' }
    expect(draftToMilestone(draft, now, original).achievedAt).toBe(
      new Date(2026, 9, 3, 12).toISOString(),
    )
  })
})

describe('isLift', () => {
  it('matches the exercise name regardless of case', () => {
    expect(
      isLift(milestone({ exerciseName: 'bench press' }), 'Bench Press'),
    ).toBe(true)
  })

  it('does not match a different exercise', () => {
    expect(isLift(milestone({ exerciseName: 'Front Squat' }), 'Squat')).toBe(
      false,
    )
  })
})

describe('groupByBaseExercise', () => {
  const bench = { exerciseId: 'bench', exerciseName: 'Bench Press' }
  const paused = {
    exerciseId: 'paused',
    exerciseName: 'Paused Bench Press',
    baseExerciseId: 'bench',
    baseExerciseName: 'Bench Press',
  }
  const incline = {
    exerciseId: 'incline',
    exerciseName: 'Incline Bench Press',
    baseExerciseId: 'bench',
    baseExerciseName: 'Bench Press',
  }

  it('is empty when there are no milestones', () => {
    expect(groupByBaseExercise([])).toEqual([])
  })

  it('puts variations under their base exercise', () => {
    const [group] = groupByBaseExercise([
      milestone({ id: 'p1', ...paused }),
      milestone({ id: 'i1', ...incline }),
      milestone({ id: 'b1', ...bench }),
    ])
    expect(group.baseExerciseName).toBe('Bench Press')
    expect(group.base?.exerciseId).toBe('bench')
    expect(group.variations.map((v) => v.exerciseName)).toEqual([
      'Incline Bench Press',
      'Paused Bench Press',
    ])
  })

  it('groups a variation even with no milestones for the base', () => {
    const groups = groupByBaseExercise([milestone({ id: 'p1', ...paused })])
    expect(groups).toHaveLength(1)
    expect(groups[0].baseExerciseId).toBe('bench')
    expect(groups[0].baseExerciseName).toBe('Bench Press')
    expect(groups[0].base).toBeNull()
    expect(groups[0].variations.map((v) => v.exerciseId)).toEqual(['paused'])
  })

  it('keeps bests and records separate for each variation', () => {
    const [group] = groupByBaseExercise([
      milestone({ id: 'b1', ...bench, weightKg: 140 }),
      milestone({ id: 'p1', ...paused, weightKg: 130 }),
    ])
    expect(group.base?.best.id).toBe('b1')
    expect(group.variations[0].best.id).toBe('p1')
  })

  it('sorts lifts by base name', () => {
    const groups = groupByBaseExercise([
      milestone({ id: 's1' }),
      milestone({ id: 'p1', ...paused }),
    ])
    expect(groups.map((g) => g.baseExerciseName)).toEqual([
      'Bench Press',
      'Squat',
    ])
  })
})
