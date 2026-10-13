import type { LegacyCheckIn, WorkoutSession } from '#/types/api'

export type HistoryItem =
  | { type: 'session'; at: string; session: WorkoutSession }
  | { type: 'legacy'; at: string; checkIn: LegacyCheckIn }

export function buildHistory(
  sessions: WorkoutSession[],
  legacyCheckIns: LegacyCheckIn[],
): HistoryItem[] {
  const items: HistoryItem[] = [
    ...sessions
      .filter((session) => session.status === 'completed')
      .map((session) => ({
        type: 'session' as const,
        at: session.startedAt,
        session,
      })),
    ...legacyCheckIns.map((checkIn) => ({
      type: 'legacy' as const,
      at: checkIn.checkedInAt,
      checkIn,
    })),
  ]
  return items.sort((a, b) => Date.parse(b.at) - Date.parse(a.at))
}
