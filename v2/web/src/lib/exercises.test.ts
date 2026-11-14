import { describe, expect, it } from 'vitest'
import {
  baseExercises,
  exerciseUsage,
  hasVariations,
  ownExercises,
} from './exercises'
import type { Exercise, Goal, Milestone } from '#/types/api'

const exercise = (overrides: Partial<Exercise>): Exercise => ({
  id: 'squat',
  userId: null,
  name: 'Squat',
  baseExerciseId: null,
  ...overrides,
})

const squat = exercise({})
const front = exercise({
  id: 'front',
  name: 'Front Squat',
  baseExerciseId: 'squat',
})
const hack = exercise({ id: 'hack', userId: 'u1', name: 'Hack Squat' })
const pin = exercise({
  id: 'pin',
  userId: 'u1',
  name: 'Pin Squat',
  baseExerciseId: 'squat',
})

describe('baseExercises', () => {
  it('is empty when there are no exercises', () => {
    expect(baseExercises([])).toEqual([])
  })

  it('leaves out exercises that are variations', () => {
    expect(baseExercises([squat, front, hack])).toEqual([squat, hack])
  })
})

describe('ownExercises', () => {
  it('is empty when there are no exercises', () => {
    expect(ownExercises([])).toEqual([])
  })

  it('leaves out shared exercises', () => {
    expect(ownExercises([squat, front, hack, pin])).toEqual([hack, pin])
  })
})

describe('hasVariations', () => {
  it('is true when another exercise is a variation of it', () => {
    expect(hasVariations('squat', [squat, front])).toBe(true)
  })

  it('is false when nothing is a variation of it', () => {
    expect(hasVariations('hack', [squat, front, hack])).toBe(false)
  })
})

describe('exerciseUsage', () => {
  const milestone = (exerciseId: string) => ({ exerciseId }) as Milestone
  const goal = (exerciseId: string) => ({ exerciseId }) as Goal

  it('is null when nothing uses the exercise', () => {
    expect(exerciseUsage('hack', [milestone('pin')], [goal('pin')])).toBe(null)
  })

  it('counts one milestone', () => {
    expect(exerciseUsage('hack', [milestone('hack')], [])).toBe(
      'Used by 1 milestone',
    )
  })

  it('counts several goals', () => {
    expect(exerciseUsage('hack', [], [goal('hack'), goal('hack')])).toBe(
      'Used by 2 goals',
    )
  })

  it('lists milestones and goals together', () => {
    const milestones = [milestone('hack'), milestone('hack'), milestone('pin')]
    expect(exerciseUsage('hack', milestones, [goal('hack')])).toBe(
      'Used by 2 milestones and 1 goal',
    )
  })
})
