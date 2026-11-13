import { localDateKey, timeForDate } from './dates'
import { isValidLift } from './lifts'
import { formatWeight, fromKg } from './units'
import type { Milestone, NewMilestone, WeightUnit } from '#/types/api'

export type PersonalRecord = 'weight' | 'reps'

export interface ExerciseMilestones {
  exerciseId: string
  exerciseName: string
  best: Milestone
  milestones: Milestone[]
  records: Map<string, PersonalRecord>
}

export interface MilestoneDraft {
  exerciseId: string
  weight: string
  unit: WeightUnit
  reps: string
  rpe: number | null
  date: string
  note: string
}

export function emptyDraft(unit: WeightUnit, now: Date): MilestoneDraft {
  return {
    exerciseId: '',
    weight: '',
    unit,
    reps: '1',
    rpe: null,
    date: localDateKey(now),
    note: '',
  }
}

export function draftFromMilestone(milestone: Milestone): MilestoneDraft {
  return {
    exerciseId: milestone.exerciseId,
    weight: String(milestone.weight),
    unit: milestone.unit,
    reps: String(milestone.reps),
    rpe: milestone.rpe,
    date: localDateKey(new Date(milestone.achievedAt)),
    note: milestone.note ?? '',
  }
}

export function draftToMilestone(
  draft: MilestoneDraft,
  now: Date,
  original?: Milestone,
): NewMilestone {
  const keepsDate =
    original && draft.date === localDateKey(new Date(original.achievedAt))
  return {
    exerciseId: draft.exerciseId,
    weight: Number(draft.weight),
    unit: draft.unit,
    reps: Number(draft.reps),
    rpe: draft.rpe,
    achievedAt: keepsDate ? original.achievedAt : timeForDate(draft.date, now),
    note: draft.note,
  }
}

export function isCompleteMilestone(draft: MilestoneDraft): boolean {
  return (
    draft.exerciseId !== '' &&
    isValidLift(draft.weight, draft.reps) &&
    draft.date !== ''
  )
}

export function formatLift(milestone: Milestone, unit: WeightUnit): string {
  return `${formatWeight(displayWeight(milestone, unit), unit)} × ${milestone.reps}`
}

export function formatLiftWithRpe(
  milestone: Milestone,
  unit: WeightUnit,
): string {
  const lift = formatLift(milestone, unit)
  return milestone.rpe === null ? lift : `${lift} @ RPE ${milestone.rpe}`
}

export function displayWeight(milestone: Milestone, unit: WeightUnit): number {
  return milestone.unit === unit
    ? milestone.weight
    : fromKg(milestone.weightKg, unit)
}

export function isLift(milestone: Milestone, lift: string): boolean {
  return milestone.exerciseName.toLowerCase() === lift.toLowerCase()
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

export interface BaseExerciseMilestones {
  baseExerciseId: string
  baseExerciseName: string
  base: ExerciseMilestones | null
  variations: ExerciseMilestones[]
}

export function groupByBaseExercise(
  milestones: Milestone[],
): BaseExerciseMilestones[] {
  const groups = new Map<string, BaseExerciseMilestones>()
  for (const variation of groupByExercise(milestones)) {
    const [first] = variation.milestones
    const baseExerciseId = first.baseExerciseId ?? first.exerciseId
    const group = groups.get(baseExerciseId) ?? {
      baseExerciseId,
      baseExerciseName: first.baseExerciseName ?? first.exerciseName,
      base: null,
      variations: [],
    }
    if (variation.exerciseId === baseExerciseId) {
      group.base = variation
    } else {
      group.variations.push(variation)
    }
    groups.set(baseExerciseId, group)
  }
  return [...groups.values()].sort((a, b) =>
    a.baseExerciseName.localeCompare(b.baseExerciseName),
  )
}
