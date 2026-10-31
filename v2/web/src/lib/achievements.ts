import { addDays, dateFromKey, localDateKey, startOfWeek } from './dates'
import { goalLadders } from './goals'
import { displayWeight } from './milestones'
import { elapsedSeconds } from './sessions'
import { completedWorkouts, visitDays, weekStreaks } from './stats'
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

export interface AchievementTier {
  label: string
  target: number
  unlockedAt: Date | null
}

export interface AchievementProgress {
  current: number
  label: string
}

export interface Achievement {
  code: string
  group: AchievementGroup
  title: string
  description: string
  tiers: AchievementTier[]
  progress: AchievementProgress | null
}

export interface AchievementSection {
  group: AchievementGroup
  achievements: Achievement[]
}

export interface AchievementData {
  sessions: WorkoutSession[]
  legacyCheckIns: LegacyCheckIn[]
  milestones: Milestone[]
  goals: Goal[]
}

const visitCounts = [1, 10, 50, 100, 250, 500, 1000]
const streakWeeks = [4, 12, 26, 52]
const hoursTrained = [100, 500]
const comebackDays = 28
const yearOfIronVisits = 100
const longHaulMinutes = 120
const clubTotalsLb = [1000, 1200, 1500]
const bigLifts = ['squat', 'bench press', 'deadlift']
const squatLb = [225, 315, 365, 405, 455, 495]
const benchLb = [135, 225, 275, 315, 365, 405]
const liftTargets = [
  { lift: 'Squat', lb: squatLb },
  { lift: 'Bench Press', lb: benchLb },
  { lift: 'Deadlift', lb: [315, 365, 405, 455, 495] },
  { lift: 'Overhead Press', lb: [135, 185, 225] },
  { lift: 'Power Clean', lb: [135, 185, 225, 275] },
  { lift: 'Paused Bench Press', lb: benchLb },
  { lift: 'Front Squat', lb: squatLb },
]
const tomPlatzReps = 23
const allRounderExercises = 5
const milestoneCounts = [1, 10, 50]
const goalsDoneCounts = [1, 10, 25, 50, 100]

const byTime = (a: Date, b: Date) => a.getTime() - b.getTime()

function nth(dates: Date[], n: number): Date | null {
  return [...dates].sort(byTime)[n - 1] ?? null
}

function plural(count: number, word: string): string {
  return `${count.toLocaleString('en-US')} ${word}${count === 1 ? '' : 's'}`
}

const slug = (text: string) => text.toLowerCase().replaceAll(' ', '-')

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

function comebackAt(days: string[]): Date | null {
  for (let i = 1; i < days.length; i++) {
    const day = dateFromKey(days[i])
    const firstDayBack = addDays(dateFromKey(days[i - 1]), comebackDays + 1)
    if (day.getTime() >= firstDayBack.getTime()) {
      return day
    }
  }
  return null
}

function visitsByYear(days: string[]): string[][] {
  const years = new Map<string, string[]>()
  for (const day of days) {
    const year = day.slice(0, 4)
    years.set(year, [...(years.get(year) ?? []), day])
  }
  return [...years.values()]
}

function yearOfIronAt(days: string[]): Date | null {
  const reached = visitsByYear(days).flatMap((yearDays) =>
    yearDays.length >= yearOfIronVisits
      ? [dateFromKey(yearDays[yearOfIronVisits - 1])]
      : [],
  )
  return nth(reached, 1)
}

const workoutMinutes = (workout: WorkoutSession) =>
  elapsedSeconds(workout, Date.parse(workout.startedAt)) / 60

const workoutEnd = (workout: WorkoutSession) =>
  new Date(workout.endedAt ?? workout.startedAt)

function hoursReachedAt(
  workouts: WorkoutSession[],
  hours: number,
): Date | null {
  let minutes = 0
  for (const workout of workouts) {
    minutes += workoutMinutes(workout)
    if (minutes >= hours * 60) {
      return workoutEnd(workout)
    }
  }
  return null
}

function longHaulAt(workouts: WorkoutSession[]): Date | null {
  const workout = workouts.find((w) => workoutMinutes(w) >= longHaulMinutes)
  return workout ? workoutEnd(workout) : null
}

const isLift = (milestone: Milestone, lift: string) =>
  milestone.exerciseName.toLowerCase() === lift.toLowerCase()

function firstMilestoneAt(
  milestones: Milestone[],
  matches: (milestone: Milestone) => boolean,
): Date | null {
  const hit = milestones.find(matches)
  return hit ? new Date(hit.achievedAt) : null
}

function bestLb(milestones: Milestone[], lift: string): number {
  return Math.max(
    0,
    ...milestones
      .filter((m) => isLift(m, lift))
      .map((m) => displayWeight(m, 'lb')),
  )
}

function clubReachedAt(milestones: Milestone[], totalLb: number): Date | null {
  const bestSingles = new Map<string, number>()
  for (const milestone of milestones) {
    const lift = bigLifts.find((name) => isLift(milestone, name))
    if (!lift || milestone.reps !== 1) {
      continue
    }
    const lb = displayWeight(milestone, 'lb')
    bestSingles.set(lift, Math.max(bestSingles.get(lift) ?? 0, lb))
    const total = [...bestSingles.values()].reduce((sum, w) => sum + w, 0)
    if (bestSingles.size === bigLifts.length && total >= totalLb) {
      return new Date(milestone.achievedAt)
    }
  }
  return null
}

function distinctExercisesAt(
  milestones: Milestone[],
  count: number,
): Date | null {
  const exercises = new Set<string>()
  for (const milestone of milestones) {
    exercises.add(milestone.exerciseId)
    if (exercises.size === count) {
      return new Date(milestone.achievedAt)
    }
  }
  return null
}

function prMonthAt(milestones: Milestone[]): Date | null {
  const liftsByMonth = new Map<string, Set<string>>()
  for (const milestone of milestones) {
    const lift = bigLifts.find((name) => isLift(milestone, name))
    if (!lift) {
      continue
    }
    const month = localDateKey(new Date(milestone.achievedAt)).slice(0, 7)
    const lifts = liftsByMonth.get(month) ?? new Set<string>()
    lifts.add(lift)
    liftsByMonth.set(month, lifts)
    if (lifts.size === bigLifts.length) {
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

function oneTier(
  achievement: Omit<Achievement, 'tiers' | 'progress'> & {
    target: number
    unlockedAt: Date | null
    progress?: AchievementProgress
  },
): Achievement {
  const { target, unlockedAt, progress, ...rest } = achievement
  return {
    ...rest,
    tiers: [{ label: rest.title, target, unlockedAt }],
    progress: progress ?? null,
  }
}

export function achievements(
  data: AchievementData,
  unit: WeightUnit,
  now: Date,
): Achievement[] {
  const days = [...visitDays(data.sessions, data.legacyCheckIns)].sort()
  const workouts = completedWorkouts(data.sessions).sort(
    (a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt),
  )
  const milestones = [...data.milestones].sort(
    (a, b) => Date.parse(a.achievedAt) - Date.parse(b.achievedAt),
  )
  const goalsDone = completedDates(data.goals)
  const weight = (lb: number) => formatWeight(fromKg(lb * kgPerLb, unit), unit)

  const minutesTrained = workouts.reduce((sum, w) => sum + workoutMinutes(w), 0)
  const longestStreak = weekStreaks(new Set(days), now).longest
  const bestYear = Math.max(0, ...visitsByYear(days).map((year) => year.length))
  const longestWorkout = Math.max(0, ...workouts.map(workoutMinutes))
  const mostSquatReps = Math.max(
    0,
    ...milestones.filter((m) => isLift(m, 'Squat')).map((m) => m.reps),
  )
  const exercisesLogged = new Set(milestones.map((m) => m.exerciseId)).size
  const singles = milestones.filter((m) => m.reps === 1)
  const singlesTotal = bigLifts.reduce(
    (sum, lift) => sum + bestLb(singles, lift),
    0,
  )

  return [
    {
      code: 'visits',
      group: 'Showing up',
      title: 'Visits',
      description: 'Go to the gym. Each day you go counts once.',
      tiers: visitCounts.map((count) => ({
        label: plural(count, 'visit'),
        target: count,
        unlockedAt: days[count - 1] ? dateFromKey(days[count - 1]) : null,
      })),
      progress: { current: days.length, label: plural(days.length, 'visit') },
    },
    {
      code: 'streak',
      group: 'Showing up',
      title: 'Weekly streak',
      description: 'Go at least once a week, weeks in a row.',
      tiers: streakWeeks.map((weeks) => ({
        label: plural(weeks, 'week'),
        target: weeks,
        unlockedAt: streakReachedAt(days, weeks),
      })),
      progress: {
        current: longestStreak,
        label: `Longest: ${plural(longestStreak, 'week')}`,
      },
    },
    {
      code: 'hours',
      group: 'Showing up',
      title: 'Time trained',
      description: 'The time across all your workouts, added up.',
      tiers: hoursTrained.map((hours) => ({
        label: plural(hours, 'hour'),
        target: hours * 60,
        unlockedAt: hoursReachedAt(workouts, hours),
      })),
      progress: {
        current: minutesTrained,
        label: plural(Math.floor(minutesTrained / 60), 'hour'),
      },
    },
    oneTier({
      code: 'comeback',
      group: 'Showing up',
      title: 'Comeback',
      description: `Come back after ${plural(comebackDays / 7, 'week')} or more off.`,
      target: 1,
      unlockedAt: comebackAt(days),
    }),
    oneTier({
      code: 'year-of-iron',
      group: 'Showing up',
      title: 'Year of iron',
      description: `Go ${yearOfIronVisits} times in one calendar year.`,
      target: yearOfIronVisits,
      unlockedAt: yearOfIronAt(days),
      progress: {
        current: bestYear,
        label: `Best year: ${plural(bestYear, 'visit')}`,
      },
    }),
    oneTier({
      code: 'long-haul',
      group: 'Showing up',
      title: 'Long haul',
      description: `Log a single workout of ${plural(longHaulMinutes / 60, 'hour')} or more.`,
      target: longHaulMinutes,
      unlockedAt: longHaulAt(workouts),
      progress: {
        current: longestWorkout,
        label: `Longest: ${plural(Math.floor(longestWorkout), 'minute')}`,
      },
    }),
    {
      code: 'club',
      group: 'Strength',
      title: 'Big three club',
      description:
        'Your best squat, bench and deadlift singles, added up. Only 1-rep lifts count.',
      tiers: clubTotalsLb.map((total) => ({
        label: `${total.toLocaleString('en-US')} lb club`,
        target: total,
        unlockedAt: clubReachedAt(milestones, total),
      })),
      progress: {
        current: singlesTotal,
        label: `Total: ${weight(singlesTotal)}`,
      },
    },
    ...liftTargets.map(({ lift, lb }): Achievement => {
      const best = bestLb(milestones, lift)
      return {
        code: slug(lift),
        group: 'Strength',
        title: lift,
        description: `${lift} for any number of reps.`,
        tiers: lb.map((target) => ({
          label: weight(target),
          target,
          unlockedAt: firstMilestoneAt(
            milestones,
            (m) => isLift(m, lift) && displayWeight(m, 'lb') >= target,
          ),
        })),
        progress: {
          current: best,
          label: best ? `Best: ${weight(best)}` : 'No lifts yet',
        },
      }
    }),
    oneTier({
      code: 'tom-platz',
      group: 'Strength',
      title: 'Tom Platz',
      description: `Squat any weight for ${tomPlatzReps} reps.`,
      target: tomPlatzReps,
      unlockedAt: firstMilestoneAt(
        milestones,
        (m) => isLift(m, 'Squat') && m.reps >= tomPlatzReps,
      ),
      progress: {
        current: mostSquatReps,
        label: `Most reps: ${mostSquatReps}`,
      },
    }),
    oneTier({
      code: 'all-rounder',
      group: 'Strength',
      title: 'All-rounder',
      description: `Log milestones on ${allRounderExercises} different exercises.`,
      target: allRounderExercises,
      unlockedAt: distinctExercisesAt(milestones, allRounderExercises),
      progress: {
        current: exercisesLogged,
        label: plural(exercisesLogged, 'exercise'),
      },
    }),
    oneTier({
      code: 'pr-month',
      group: 'Strength',
      title: 'PR month',
      description:
        'Log squat, bench and deadlift milestones in the same calendar month.',
      target: 1,
      unlockedAt: prMonthAt(milestones),
    }),
    {
      code: 'milestones',
      group: 'Goals and milestones',
      title: 'Milestones',
      description: 'Log your personal records.',
      tiers: milestoneCounts.map((count) => ({
        label: plural(count, 'milestone'),
        target: count,
        unlockedAt: nth(
          milestones.map((m) => new Date(m.achievedAt)),
          count,
        ),
      })),
      progress: {
        current: milestones.length,
        label: plural(milestones.length, 'milestone'),
      },
    },
    {
      code: 'goals-done',
      group: 'Goals and milestones',
      title: 'Goals done',
      description: 'Complete the goals you set.',
      tiers: goalsDoneCounts.map((count) => ({
        label: plural(count, 'goal'),
        target: count,
        unlockedAt: nth(goalsDone, count),
      })),
      progress: {
        current: goalsDone.length,
        label: plural(goalsDone.length, 'goal'),
      },
    },
    oneTier({
      code: 'goal-set',
      group: 'Goals and milestones',
      title: 'First goal',
      description: 'Set a goal.',
      target: 1,
      unlockedAt: nth(
        data.goals.map((goal) => new Date(goal.createdAt)),
        1,
      ),
    }),
    oneTier({
      code: 'ladder-done',
      group: 'Goals and milestones',
      title: 'Top of the ladder',
      description:
        'Complete every goal for one exercise, with at least two goals.',
      target: 1,
      unlockedAt: ladderCompletedAt(data.goals),
    }),
  ]
}

export function unlockedTiers(achievement: Achievement): number {
  return achievement.tiers.filter((tier) => tier.unlockedAt).length
}

export function currentTier(achievement: Achievement): AchievementTier | null {
  return achievement.tiers.filter((tier) => tier.unlockedAt).at(-1) ?? null
}

export function tierStatus(achievement: Achievement): string {
  const current = currentTier(achievement)
  if (achievement.tiers.length === 1) {
    return current ? 'Unlocked' : 'Locked'
  }
  return current ? current.label : `Next: ${achievement.tiers[0].label}`
}

export function tierColorIndex(
  level: number,
  tierCount: number,
  colorCount: number,
): number {
  if (tierCount === 1) {
    return colorCount - 1
  }
  return Math.round(((level - 1) / (tierCount - 1)) * (colorCount - 1))
}

export function nextTier(achievement: Achievement): AchievementTier | null {
  return achievement.tiers.find((tier) => !tier.unlockedAt) ?? null
}

export function progressToNextTier(achievement: Achievement): number | null {
  const next = nextTier(achievement)
  if (!next || !achievement.progress) {
    return null
  }
  return (achievement.progress.current / next.target) * 100
}

export function achievementSections(all: Achievement[]): AchievementSection[] {
  const sections: AchievementSection[] = []
  for (const achievement of all) {
    const section = sections.find((s) => s.group === achievement.group)
    if (section) {
      section.achievements.push(achievement)
    } else {
      sections.push({ group: achievement.group, achievements: [achievement] })
    }
  }
  return sections
}
