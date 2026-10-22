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

export interface HistoryMonth {
  year: number
  month: number
  items: HistoryItem[]
}

export function groupByMonth(items: HistoryItem[]): HistoryMonth[] {
  const months: HistoryMonth[] = []
  for (const item of items) {
    const date = new Date(item.at)
    const last = months.at(-1)
    if (last?.year === date.getFullYear() && last.month === date.getMonth()) {
      last.items.push(item)
    } else {
      months.push({
        year: date.getFullYear(),
        month: date.getMonth(),
        items: [item],
      })
    }
  }
  return months
}
