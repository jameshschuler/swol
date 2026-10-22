import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { formatMonth, groupByDay, localDateKey, monthGrid } from '#/lib/dates'
import { formatDate } from '#/lib/format'
import type { HistoryItem } from '#/lib/history'
import { cn } from '#/lib/utils'
import { HistoryTiles } from './HistoryTiles'

const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function HistoryCalendar({ items }: { items: HistoryItem[] }) {
  const today = new Date()
  const [month, setMonth] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  })
  const [selected, setSelected] = useState<string | null>(localDateKey(today))
  const byDay = groupByDay(items, (item) => item.at)
  const selectedItems = selected ? (byDay.get(selected) ?? []) : []

  const shiftMonth = (by: number) => {
    const next = new Date(month.year, month.month + by, 1)
    setMonth({ year: next.getFullYear(), month: next.getMonth() })
    setSelected(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Button
          variant="neutral"
          size="icon-sm"
          aria-label="Previous month"
          onClick={() => shiftMonth(-1)}
        >
          <ChevronLeft />
        </Button>
        <p className="font-heading">{formatMonth(month.year, month.month)}</p>
        <Button
          variant="neutral"
          size="icon-sm"
          aria-label="Next month"
          onClick={() => shiftMonth(1)}
        >
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekdays.map((day, i) => (
          <p key={i} className="text-xs font-heading">
            {day}
          </p>
        ))}
        {monthGrid(month.year, month.month).map((date) => {
          const key = localDateKey(date)
          const count = byDay.get(key)?.length ?? 0
          return (
            <button
              key={key}
              type="button"
              onClick={() => setSelected(key)}
              aria-pressed={key === selected}
              aria-label={`${formatDate(date.toISOString())}${count ? `, ${count} logged` : ''}`}
              className={cn(
                'aspect-square rounded-base border-2 text-sm tabular-nums',
                count
                  ? 'border-border bg-main font-heading text-main-foreground'
                  : 'border-transparent',
                date.getMonth() !== month.month && 'opacity-40',
                key === selected &&
                  'ring-2 ring-ring ring-offset-2 ring-offset-background',
              )}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
      {selected ? (
        <div className="flex flex-col gap-2">
          <p className="font-heading">
            {formatDate(new Date(`${selected}T12:00`).toISOString())}
          </p>
          {selectedItems.length === 0 ? (
            <p className="text-sm">Nothing logged this day.</p>
          ) : (
            <HistoryTiles items={selectedItems} />
          )}
        </div>
      ) : (
        <p className="text-sm">Tap a day to see what you logged.</p>
      )}
    </div>
  )
}
