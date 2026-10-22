import { formatMonth } from '#/lib/dates'
import { groupByMonth } from '#/lib/history'
import type { HistoryItem } from '#/lib/history'
import { HistoryTiles } from './HistoryTiles'

export function HistoryList({ items }: { items: HistoryItem[] }) {
  return (
    <div className="flex flex-col gap-6">
      {groupByMonth(items).map(({ year, month, items: monthItems }) => (
        <section key={`${year}-${month}`} className="flex flex-col gap-3">
          <h3 className="font-heading">{formatMonth(year, month)}</h3>
          <HistoryTiles items={monthItems} />
        </section>
      ))}
    </div>
  )
}
