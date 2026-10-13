import type { HistoryItem } from '#/lib/history'
import { LegacyCheckInRow } from './LegacyCheckInRow'
import { SessionHistoryRow } from './SessionHistoryRow'

export function HistoryList({ items }: { items: HistoryItem[] }) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((item) =>
        item.type === 'session' ? (
          <SessionHistoryRow key={item.session.id} session={item.session} />
        ) : (
          <LegacyCheckInRow
            key={`v1-${item.checkIn.id}`}
            checkIn={item.checkIn}
          />
        ),
      )}
    </div>
  )
}
