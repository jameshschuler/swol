import { formatList } from './format'
import type { Exercise, Goal, Milestone } from '#/types/api'

export function baseExercises(exercises: Exercise[]): Exercise[] {
  return exercises.filter((exercise) => exercise.baseExerciseId === null)
}

export function ownExercises(exercises: Exercise[]): Exercise[] {
  return exercises.filter((exercise) => exercise.userId !== null)
}

export function sharedExercises(exercises: Exercise[]): Exercise[] {
  return exercises.filter((exercise) => exercise.userId === null)
}

export function hiddenLast(exercises: Exercise[]): Exercise[] {
  return [...exercises].sort((a, b) => Number(a.hidden) - Number(b.hidden))
}

export function pickableExercises(
  exercises: Exercise[],
  selectedId: string | null,
): Exercise[] {
  return exercises.filter(
    (exercise) => !exercise.hidden || exercise.id === selectedId,
  )
}

export function hasVariations(
  exerciseId: string,
  exercises: Exercise[],
): boolean {
  return exercises.some((exercise) => exercise.baseExerciseId === exerciseId)
}

export function exerciseUsage(
  exerciseId: string,
  milestones: Milestone[],
  goals: Goal[],
): string | null {
  const count = (items: { exerciseId: string }[], noun: string) => {
    const n = items.filter((item) => item.exerciseId === exerciseId).length
    return n === 0 ? [] : [`${n} ${n === 1 ? noun : `${noun}s`}`]
  }
  const uses = [...count(milestones, 'milestone'), ...count(goals, 'goal')]
  return uses.length === 0 ? null : `Used by ${formatList(uses)}`
}
