import { isValidLift } from './lifts'
import { formatWeight, fromKg } from './units'
import type { Milestone, WeightUnit } from '#/types/api'

export type PersonalRecord = 'weight' | 'reps'

export interface ExerciseMilestones {
  exerciseId: string
  exerciseName: string
  best: Milestone
  milestones: Milestone[]
  records: Map<string, PersonalRecord>
}

export function isCompleteMilestone(form: {
  exerciseId: string
  weight: string
  reps: string
  date: string
}): boolean {
  return (
    form.exerciseId !== '' &&
    isValidLift(form.weight, form.reps) &&
    form.date !== ''
  )
}

export function formatLift(milestone: Milestone, unit: WeightUnit): string {
  return `${formatWeight(displayWeight(milestone, unit), unit)} × ${milestone.reps}`
}

export function displayWeight(milestone: Milestone, unit: WeightUnit): number {
  return milestone.unit === unit
    ? milestone.weight
    : fromKg(milestone.weightKg, unit)
}

function isFirst(a: Milestone, b: Milestone): boolean {
  const byDate = Date.parse(a.achievedAt) - Date.parse(b.achievedAt)
  return byDate !== 0 ? byDate < 0 : a.id < b.id
}

function isHeavier(candidate: Milestone, current: Milestone): boolean {
  if (candidate.weightKg !== current.weightKg) {
    return candidate.weightKg > current.weightKg
  }
  if (candidate.reps !== current.reps) {
    return candidate.reps > current.reps
  }
  return isFirst(candidate, current)
}

function beats(other: Milestone, milestone: Milestone): boolean {
  if (other.weightKg < milestone.weightKg || other.reps < milestone.reps) {
    return false
  }
  const isSameLift =
    other.weightKg === milestone.weightKg && other.reps === milestone.reps
  return !isSameLift || isFirst(other, milestone)
}

export function personalRecords(
  milestones: Milestone[],
  best: Milestone,
): Map<string, PersonalRecord> {
  const records = new Map<string, PersonalRecord>([[best.id, 'weight']])
  for (const milestone of milestones) {
    const isBeaten = milestones.some(
      (other) => other !== milestone && beats(other, milestone),
    )
    if (!isBeaten && milestone !== best) {
      records.set(milestone.id, 'reps')
    }
  }
  return records
}

export function groupByExercise(milestones: Milestone[]): ExerciseMilestones[] {
  const groups = new Map<string, ExerciseMilestones>()
  for (const milestone of milestones) {
    const group = groups.get(milestone.exerciseId)
    if (!group) {
      groups.set(milestone.exerciseId, {
        exerciseId: milestone.exerciseId,
        exerciseName: milestone.exerciseName,
        best: milestone,
        milestones: [milestone],
        records: new Map(),
      })
      continue
    }
    group.milestones.push(milestone)
    if (isHeavier(milestone, group.best)) {
      group.best = milestone
    }
  }
  for (const group of groups.values()) {
    group.records = personalRecords(group.milestones, group.best)
  }
  return [...groups.values()].sort((a, b) =>
    a.exerciseName.localeCompare(b.exerciseName),
  )
}
