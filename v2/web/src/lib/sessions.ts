import { msPerHour } from './dates'
import { formatTime } from './format'
import type { WorkoutSession } from '#/types/api'

export function elapsedSeconds(session: WorkoutSession, now: number): number {
  const end = session.endedAt ?? session.pausedAt
  const endMs = end ? Date.parse(end) : now
  const totalSeconds = Math.floor(
    (endMs - Date.parse(session.startedAt)) / 1000,
  )
  return Math.max(0, totalSeconds - session.pausedSeconds)
}

export function sessionTimes(session: WorkoutSession): string | undefined {
  if (session.kind === 'check_in') {
    const backdated =
      Math.abs(Date.parse(session.createdAt) - Date.parse(session.startedAt)) >
      msPerHour
    return backdated
      ? undefined
      : `Checked in at ${formatTime(session.startedAt)}`
  }
  if (session.endedAt) {
    return `${formatTime(session.startedAt)} – ${formatTime(session.endedAt)}`
  }
  return `Started at ${formatTime(session.startedAt)}`
}
