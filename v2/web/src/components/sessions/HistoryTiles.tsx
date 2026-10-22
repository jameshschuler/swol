import { formatDuration } from '#/lib/format'
import type { HistoryItem } from '#/lib/history'
import { elapsedSeconds } from '#/lib/sessions'
import { HistoryTile } from './HistoryTile'

export function HistoryTiles({ items }: { items: HistoryItem[] }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-7">
      {items.map((item) =>
        item.type === 'session' ? (
          <HistoryTile
            key={item.session.id}
            at={item.at}
            sessionId={item.session.id}
            detail={
              item.session.kind === 'check_in'
                ? 'Check-in'
                : formatDuration(elapsedSeconds(item.session, Date.now()))
            }
          />
        ) : (
          <HistoryTile
            key={`v1-${item.checkIn.id}`}
            at={item.at}
            detail="Check-in"
          />
        ),
      )}
    </div>
  )
}
