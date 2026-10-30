import { estimatedOneRepMax } from './lifts'
import { formatWeight, fromKg } from './units'
import type { Goal, Milestone, WeightUnit } from '#/types/api'

export function displayTarget(goal: Goal, unit: WeightUnit): number {
  return goal.unit === unit
    ? goal.targetWeight
    : fromKg(goal.targetWeightKg, unit)
}

export function formatGoalTarget(goal: Goal, unit: WeightUnit): string {
  return `${formatWeight(displayTarget(goal, unit), unit)} × ${goal.targetReps}`
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
  remainingKg: number
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
  const remainingKg = Math.max(0, goal.targetWeightKg - (best?.weightKg ?? 0))
  const completedBy =
    milestones.find((m) => m.id === goal.completedMilestoneId) ?? null
  return { best, remainingKg, hitBy, completedBy }
}

export function goalStatus(
  goal: Goal,
  progress: GoalProgress,
  unit: WeightUnit,
): string | null {
  if (progress.hitBy) {
    return null
  }
  if (progress.best) {
    return `${formatWeight(fromKg(progress.remainingKg, unit), unit)} to go`
  }
  return goal.targetReps === 1
    ? 'No lifts yet'
    : `No ${goal.targetReps}-rep lifts yet`
}

export interface GoalWithProgress {
  goal: Goal
  progress: GoalProgress
}

export function closestGoals(
  goals: Goal[],
  milestones: Milestone[],
  limit: number,
): GoalWithProgress[] {
  const distance = ({ progress }: GoalWithProgress) =>
    progress.best ? progress.remainingKg : Number.MAX_VALUE
  return goals
    .filter((goal) => !goal.completedAt)
    .map((goal) => ({ goal, progress: goalProgress(goal, milestones) }))
    .sort((a, b) => distance(a) - distance(b))
    .slice(0, limit)
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

export interface GoalLadder {
  exerciseId: string
  exerciseName: string
  goals: Goal[]
}

export function goalLadders(goals: Goal[]): GoalLadder[] {
  const ladders = new Map<string, GoalLadder>()
  for (const goal of goals) {
    const ladder = ladders.get(goal.exerciseId) ?? {
      exerciseId: goal.exerciseId,
      exerciseName: goal.exerciseName,
      goals: [],
    }
    ladder.goals.push(goal)
    ladders.set(goal.exerciseId, ladder)
  }
  for (const ladder of ladders.values()) {
    ladder.goals.sort(
      (a, b) =>
        estimatedOneRepMax(b.targetWeightKg, b.targetReps) -
        estimatedOneRepMax(a.targetWeightKg, a.targetReps),
    )
  }
  return [...ladders.values()].sort((a, b) =>
    a.exerciseName.localeCompare(b.exerciseName),
  )
}
