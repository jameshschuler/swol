import { addDays, dateFromKey, localDateKey, startOfWeek } from './dates'
import { goalLadders } from './goals'
import { displayWeight } from './milestones'
import { elapsedSeconds } from './sessions'
import { visitDays } from './stats'
import { formatWeight, fromKg, kgPerLb } from './units'
import type {
  Goal,
  LegacyCheckIn,
  Milestone,
  WeightUnit,
  WorkoutSession,
} from '#/types/api'

export type AchievementGroup =
  'Showing up' | 'Strength' | 'Goals and milestones'

export interface Achievement {
  code: string
  group: AchievementGroup
  series: string
  title: string
  description: string
  unlockedAt: Date | null
}

export interface AchievementSection {
  group: AchievementGroup
  series: Achievement[][]
}

export interface AchievementData {
  sessions: WorkoutSession[]
  legacyCheckIns: LegacyCheckIn[]
  milestones: Milestone[]
  goals: Goal[]
}

const visitCounts = [1, 10, 50, 100, 250, 500]
const streakWeeks = [4, 12, 26, 52]
const hoursTrained = 100
const clubTotalsLb = [1000, 1200, 1500]
const clubLifts = ['squat', 'bench press', 'deadlift']
const liftTargets = [
  { lift: 'Squat', short: 'squat', lb: [225, 315, 365, 405] },
  { lift: 'Bench Press', short: 'bench', lb: [135, 225, 275, 315] },
  { lift: 'Deadlift', short: 'deadlift', lb: [315, 365, 405, 455, 495] },
]
const milestoneCounts = [1, 10, 50]
const goalsDoneCounts = [1, 10]

const byTime = (a: Date, b: Date) => a.getTime() - b.getTime()

function nth(dates: Date[], n: number): Date | null {
  return [...dates].sort(byTime)[n - 1] ?? null
}

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? '' : 's'}`
}

function streakReachedAt(days: string[], weeks: number): Date | null {
  const firstVisitByWeek = new Map<string, string>()
  for (const day of days) {
    const week = localDateKey(startOfWeek(dateFromKey(day)))
    if (!firstVisitByWeek.has(week)) {
      firstVisitByWeek.set(week, day)
    }
  }
  let run = 0
  let previousWeek: string | null = null
  for (const [week, day] of firstVisitByWeek) {
    const isNextWeek =
      previousWeek !== null &&
      localDateKey(addDays(dateFromKey(previousWeek), 7)) === week
    run = isNextWeek ? run + 1 : 1
    if (run === weeks) {
      return dateFromKey(day)
    }
    previousWeek = week
  }
  return null
}

function hoursReachedAt(
  sessions: WorkoutSession[],
  hours: number,
): Date | null {
  const workouts = sessions
    .filter((s) => s.kind === 'workout' && s.status === 'completed')
    .sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt))
  let seconds = 0
  for (const workout of workouts) {
    seconds += elapsedSeconds(workout, Date.parse(workout.startedAt))
    if (seconds >= hours * 3600) {
      return new Date(workout.endedAt ?? workout.startedAt)
    }
  }
  return null
}

const isLift = (milestone: Milestone, lift: string) =>
  milestone.exerciseName.toLowerCase() === lift.toLowerCase()

function liftReachedAt(
  milestones: Milestone[],
  lift: string,
  lb: number,
): Date | null {
  const hit = milestones.find(
    (m) => isLift(m, lift) && displayWeight(m, 'lb') >= lb,
  )
  return hit ? new Date(hit.achievedAt) : null
}

function clubReachedAt(milestones: Milestone[], totalLb: number): Date | null {
  const bestSingles = new Map<string, number>()
  for (const milestone of milestones) {
    const lift = clubLifts.find((name) => isLift(milestone, name))
    if (!lift || milestone.reps !== 1) {
      continue
    }
    const lb = displayWeight(milestone, 'lb')
    bestSingles.set(lift, Math.max(bestSingles.get(lift) ?? 0, lb))
    const total = [...bestSingles.values()].reduce((sum, w) => sum + w, 0)
    if (bestSingles.size === clubLifts.length && total >= totalLb) {
      return new Date(milestone.achievedAt)
    }
  }
  return null
}

function completedDates(goals: Goal[]): Date[] {
  return goals.flatMap((goal) =>
    goal.completedAt ? [new Date(goal.completedAt)] : [],
  )
}

function ladderCompletedAt(goals: Goal[]): Date | null {
  const finished = goalLadders(goals).flatMap((ladder) => {
    const dates = completedDates(ladder.goals).sort(byTime)
    return dates.length > 1 && dates.length === ladder.goals.length
      ? [dates[dates.length - 1]]
      : []
  })
  return nth(finished, 1)
}

export function achievements(
  data: AchievementData,
  unit: WeightUnit,
): Achievement[] {
  const days = [...visitDays(data.sessions, data.legacyCheckIns)].sort()
  const milestones = [...data.milestones].sort(
    (a, b) => Date.parse(a.achievedAt) - Date.parse(b.achievedAt),
  )
  const weight = (lb: number) => formatWeight(fromKg(lb * kgPerLb, unit), unit)

  return [
    ...visitCounts.map((count) => ({
      code: `visits-${count}`,
      group: 'Showing up' as const,
      series: 'visits',
      title: count === 1 ? 'First visit' : `${count} visits`,
      description: `Go to the gym ${count === 1 ? 'once' : `${count} times`}.`,
      unlockedAt: days[count - 1] ? dateFromKey(days[count - 1]) : null,
    })),
    ...streakWeeks.map((weeks) => ({
      code: `streak-${weeks}`,
      group: 'Showing up' as const,
      series: 'streak',
      title: `${weeks}-week streak`,
      description: `Go at least once a week for ${plural(weeks, 'week')} in a row.`,
      unlockedAt: streakReachedAt(days, weeks),
    })),
    {
      code: `hours-${hoursTrained}`,
      group: 'Showing up' as const,
      series: 'hours',
      title: `${hoursTrained} hours`,
      description: `Log ${hoursTrained} hours of workouts.`,
      unlockedAt: hoursReachedAt(data.sessions, hoursTrained),
    },
    ...clubTotalsLb.map((total) => ({
      code: `club-${total}`,
      group: 'Strength' as const,
      series: 'club',
      title: `${total.toLocaleString('en-US')} lb club`,
      description: `Squat, bench and deadlift singles add up to ${weight(total)}.`,
      unlockedAt: clubReachedAt(milestones, total),
    })),
    ...liftTargets.flatMap(({ lift, short, lb }) =>
      lb.map((target) => ({
        code: `${short}-${target}`,
        group: 'Strength' as const,
        series: short,
        title: `${target} lb ${short}`,
        description: `${lift} ${weight(target)} for any reps.`,
        unlockedAt: liftReachedAt(milestones, lift, target),
      })),
    ),
    ...milestoneCounts.map((count) => ({
      code: `milestones-${count}`,
      group: 'Goals and milestones' as const,
      series: 'milestones',
      title: count === 1 ? 'First milestone' : `${count} milestones`,
      description: `Log ${plural(count, 'milestone')}.`,
      unlockedAt: nth(
        milestones.map((m) => new Date(m.achievedAt)),
        count,
      ),
    })),
    {
      code: 'goal-set',
      group: 'Goals and milestones' as const,
      series: 'goals',
      title: 'First goal',
      description: 'Set a goal.',
      unlockedAt: nth(
        data.goals.map((goal) => new Date(goal.createdAt)),
        1,
      ),
    },
    ...goalsDoneCounts.map((count) => ({
      code: `goals-done-${count}`,
      group: 'Goals and milestones' as const,
      series: 'goals',
      title: count === 1 ? 'Goal getter' : `${count} goals done`,
      description: `Complete ${plural(count, 'goal')}.`,
      unlockedAt: nth(completedDates(data.goals), count),
    })),
    {
      code: 'ladder-done',
      group: 'Goals and milestones' as const,
      series: 'ladder',
      title: 'Top of the ladder',
      description: 'Complete every goal for one exercise (at least two).',
      unlockedAt: ladderCompletedAt(data.goals),
    },
  ]
}

export function achievementSections(all: Achievement[]): AchievementSection[] {
  const sections: AchievementSection[] = []
  for (const achievement of all) {
    let section = sections.find((s) => s.group === achievement.group)
    if (!section) {
      section = { group: achievement.group, series: [] }
      sections.push(section)
    }
    const last = section.series.at(-1)
    if (last?.[0].series === achievement.series) {
      last.push(achievement)
    } else {
      section.series.push([achievement])
    }
  }
  return sections
}
