import { describe, expect, it } from 'vitest'
import { baseExercises } from './exercises'
import type { Exercise } from '#/types/api'

const exercise = (overrides: Partial<Exercise>): Exercise => ({
  id: 'squat',
  userId: null,
  name: 'Squat',
  baseExerciseId: null,
  ...overrides,
})

describe('baseExercises', () => {
  it('is empty when there are no exercises', () => {
    expect(baseExercises([])).toEqual([])
  })

  it('leaves out exercises that are variations', () => {
    const squat = exercise({})
    const front = exercise({
      id: 'front',
      name: 'Front Squat',
      baseExerciseId: 'squat',
    })
    const own = exercise({ id: 'hack', userId: 'u1', name: 'Hack Squat' })
    expect(baseExercises([squat, front, own])).toEqual([squat, own])
  })
})
