import type { Exercise } from '#/types/api'

export function baseExercises(exercises: Exercise[]): Exercise[] {
  return exercises.filter((exercise) => exercise.baseExerciseId === null)
}
