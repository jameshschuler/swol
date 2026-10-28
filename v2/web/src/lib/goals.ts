import { fromKg } from './units'
import type { Goal, Milestone, WeightUnit } from '#/types/api'

export function displayTarget(goal: Goal, unit: WeightUnit): number {
  return goal.unit === unit
    ? goal.targetWeight
    : fromKg(goal.targetWeightKg, unit)
}

export function meetsGoal(
  milestone: Pick<Milestone, 'exerciseId' | 'weightKg' | 'reps'>,
  goal: Goal,
): boolean {
  return (
    milestone.exerciseId === goal.exerciseId &&
    milestone.weightKg >= goal.targetWeightKg &&
    milestone.reps >= goal.targetReps
  )
}

export interface GoalProgress {
  best: Milestone | null
  percent: number
  hitBy: Milestone | null
  completedBy: Milestone | null
}

export function goalProgress(
  goal: Goal,
  milestones: Milestone[],
): GoalProgress {
  const attempts = milestones.filter(
    (m) => m.exerciseId === goal.exerciseId && m.reps >= goal.targetReps,
  )
  const best = attempts.reduce<Milestone | null>(
    (top, m) => (!top || m.weightKg > top.weightKg ? m : top),
    null,
  )
  const hits = milestones.filter((m) => meetsGoal(m, goal))
  const hitBy = hits.reduce<Milestone | null>(
    (first, m) =>
      !first || Date.parse(m.achievedAt) < Date.parse(first.achievedAt)
        ? m
        : first,
    null,
  )
  const percent = best
    ? Math.min(100, Math.floor((best.weightKg / goal.targetWeightKg) * 100))
    : 0
  const completedBy =
    milestones.find((m) => m.id === goal.completedMilestoneId) ?? null
  return { best, percent, hitBy, completedBy }
}

export function goalsNewlyHit(
  milestone: Pick<Milestone, 'exerciseId' | 'weightKg' | 'reps'>,
  goals: Goal[],
  previousMilestones: Milestone[],
): Goal[] {
  return goals.filter(
    (goal) =>
      !goal.completedAt &&
      meetsGoal(milestone, goal) &&
      !previousMilestones.some((previous) => meetsGoal(previous, goal)),
  )
}
