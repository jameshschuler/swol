import { localDateKey } from './dates'
import { displayWeight, isLift } from './milestones'
import type { Milestone, WeightUnit } from '#/types/api'

export interface LiftTotal {
  name: string
  lifts: string[]
}

export interface TotalPoint {
  achievedAt: string
  total: number
  bests: Milestone[]
}

interface LiftSingle {
  lift: string
  single: Milestone
}

export const powerliftingTotal: LiftTotal = {
  name: 'SBD total',
  lifts: ['Squat', 'Bench Press', 'Deadlift'],
}

export const weightliftingTotal: LiftTotal = {
  name: 'Olympic total',
  lifts: ['Snatch', 'Clean and Jerk'],
}

function singlesByDate(milestones: Milestone[], lifts: string[]): LiftSingle[] {
  return milestones
    .flatMap((single) => {
      const lift =
        single.reps === 1 ? lifts.find((name) => isLift(single, name)) : null
      return lift ? [{ lift, single }] : []
    })
    .sort(
      (a, b) =>
        Date.parse(a.single.achievedAt) - Date.parse(b.single.achievedAt),
    )
}

const dayOf = (point: TotalPoint) => localDateKey(new Date(point.achievedAt))

export function totalHistory(
  milestones: Milestone[],
  lifts: string[],
  unit: WeightUnit,
): TotalPoint[] {
  const bests = new Map<string, Milestone>()
  const points: TotalPoint[] = []
  for (const { lift, single } of singlesByDate(milestones, lifts)) {
    const best = bests.get(lift)
    if (best && best.weightKg >= single.weightKg) {
      continue
    }
    bests.set(lift, single)
    if (bests.size < lifts.length) {
      continue
    }
    const current = lifts.flatMap((name) => bests.get(name) ?? [])
    const point = {
      achievedAt: single.achievedAt,
      total: current.reduce((sum, m) => sum + displayWeight(m, unit), 0),
      bests: current,
    }
    const last = points.at(-1)
    if (last && dayOf(last) === dayOf(point)) {
      points[points.length - 1] = point
    } else {
      points.push(point)
    }
  }
  return points
}

export function missingLifts(
  milestones: Milestone[],
  lifts: string[],
): string[] {
  const singles = singlesByDate(milestones, lifts)
  return lifts.filter((lift) => !singles.some((s) => s.lift === lift))
}

export function hasStarted(milestones: Milestone[], lifts: string[]): boolean {
  return milestones.some((milestone) =>
    lifts.some((lift) => isLift(milestone, lift)),
  )
}
