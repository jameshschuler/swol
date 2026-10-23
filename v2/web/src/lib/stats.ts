import { addDays, localDateKey, msPerWeek, startOfWeek } from './dates'
import { elapsedSeconds } from './sessions'
import type { LegacyCheckIn, WorkoutSession } from '#/types/api'

export interface VisitCount {
  start: Date
  visits: number
}

export function visitDays(
  sessions: WorkoutSession[],
  legacyCheckIns: LegacyCheckIn[],
): Set<string> {
  return new Set([
    ...sessions
      .filter((session) => session.status === 'completed')
      .map((session) => localDateKey(new Date(session.startedAt))),
    ...legacyCheckIns.map((checkIn) =>
      localDateKey(new Date(checkIn.checkedInAt)),
    ),
  ])
}

function dateFromKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function visitsBetween(days: Set<string>, start: Date, end: Date): number {
  const from = localDateKey(start)
  const to = localDateKey(end)
  return [...days].filter((day) => day >= from && day < to).length
}

export function visitTotals(days: Set<string>, now: Date) {
  const tomorrow = addDays(now, 1)
  return {
    all: days.size,
    thisMonth: visitsBetween(
      days,
      new Date(now.getFullYear(), now.getMonth(), 1),
      tomorrow,
    ),
  }
}

export function weekStreaks(days: Set<string>, now: Date) {
  const weeks = new Set(
    [...days].map((day) => localDateKey(startOfWeek(dateFromKey(day)))),
  )
  const hasVisit = (week: Date) => weeks.has(localDateKey(week))

  let longest = 0
  for (const week of weeks) {
    const start = dateFromKey(week)
    if (hasVisit(addDays(start, -7))) {
      continue
    }
    let length = 1
    while (hasVisit(addDays(start, length * 7))) {
      length++
    }
    longest = Math.max(longest, length)
  }

  const thisWeek = startOfWeek(now)
  let week = hasVisit(thisWeek) ? thisWeek : addDays(thisWeek, -7)
  let current = 0
  while (hasVisit(week)) {
    current++
    week = addDays(week, -7)
  }
  return { current, longest }
}

export function visitsPerWeek(
  days: Set<string>,
  now: Date,
  weeks: number,
): VisitCount[] {
  const first = addDays(startOfWeek(now), -(weeks - 1) * 7)
  return Array.from({ length: weeks }, (_, i) => {
    const start = addDays(first, i * 7)
    return { start, visits: visitsBetween(days, start, addDays(start, 7)) }
  })
}

export function visitsPerMonth(
  days: Set<string>,
  now: Date,
  months: number,
): VisitCount[] {
  return Array.from({ length: months }, (_, i) => {
    const start = new Date(now.getFullYear(), now.getMonth() - months + 1 + i)
    const end = new Date(start.getFullYear(), start.getMonth() + 1)
    return { start, visits: visitsBetween(days, start, end) }
  })
}

export function visitsByWeekday(days: Set<string>): number[] {
  const counts = Array.from({ length: 7 }, () => 0)
  for (const day of days) {
    counts[dateFromKey(day).getDay()]++
  }
  return counts
}

export function firstVisit(days: Set<string>): Date | null {
  let first: string | null = null
  for (const day of days) {
    if (first === null || day < first) {
      first = day
    }
  }
  return first ? dateFromKey(first) : null
}

function perWeek(visits: number, start: Date, end: Date): number {
  return visits / Math.max(1, (end.getTime() - start.getTime()) / msPerWeek)
}

export function lifetimeVisitsPerWeek(days: Set<string>, now: Date): number {
  const first = firstVisit(days)
  return first ? perWeek(days.size, first, addDays(now, 1)) : 0
}

export function visitYears(days: Set<string>, now: Date): number[] {
  const thisYear = now.getFullYear()
  const first = Math.min(firstVisit(days)?.getFullYear() ?? thisYear, thisYear)
  return Array.from({ length: thisYear - first + 1 }, (_, i) => thisYear - i)
}

export function yearStats(days: Set<string>, year: number, now: Date) {
  const first = firstVisit(days)
  const yearStart = new Date(year, 0, 1)
  const start = first && first > yearStart ? first : yearStart
  const nextYear = new Date(year + 1, 0, 1)
  const tomorrow = addDays(now, 1)
  const end = tomorrow < nextYear ? tomorrow : nextYear
  if (end <= start) {
    return { visits: 0, visitsPerWeek: 0 }
  }
  const visits = visitsBetween(days, start, end)
  return { visits, visitsPerWeek: perWeek(visits, start, end) }
}

function completedWorkouts(sessions: WorkoutSession[]): WorkoutSession[] {
  return sessions.filter(
    (session) => session.kind === 'workout' && session.status === 'completed',
  )
}

export function workoutTotals(sessions: WorkoutSession[], now: number) {
  const workouts = completedWorkouts(sessions)
  const totalSeconds = workouts.reduce(
    (sum, workout) => sum + elapsedSeconds(workout, now),
    0,
  )
  return {
    count: workouts.length,
    totalSeconds,
    averageSeconds: workouts.length ? totalSeconds / workouts.length : 0,
  }
}

export function recentWorkoutLengths(
  sessions: WorkoutSession[],
  now: number,
  limit: number,
) {
  return completedWorkouts(sessions)
    .sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt))
    .slice(-limit)
    .map((workout) => ({
      start: new Date(workout.startedAt),
      minutes: Math.round(elapsedSeconds(workout, now) / 60),
    }))
}

export function heatmapWeeks(now: Date, weeks: number): Date[][] {
  const first = addDays(startOfWeek(now), -(weeks - 1) * 7)
  return Array.from({ length: weeks }, (_week, week) =>
    Array.from({ length: 7 }, (_day, day) => addDays(first, week * 7 + day)),
  )
}
