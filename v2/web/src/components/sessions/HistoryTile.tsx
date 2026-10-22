import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { formatDate, formatShortWeekday, formatTime } from '#/lib/format'

const tileClass =
  'flex aspect-square flex-col rounded-base border-2 border-border bg-secondary-background p-2'

export function HistoryTile({
  at,
  detail,
  sessionId,
}: {
  at: string
  detail: string
  sessionId?: string
}) {
  const date = new Date(at)
  const label = `${formatDate(at)} at ${formatTime(at)}, ${detail}`
  const content: ReactNode = (
    <>
      <span className="sr-only">{label}</span>
      <span aria-hidden className="text-xs">
        {formatShortWeekday(date)}
      </span>
      <span aria-hidden className="font-heading text-2xl leading-none">
        {date.getDate()}
      </span>
      <span
        aria-hidden
        className="mt-auto text-[11px] leading-tight font-heading tabular-nums"
      >
        {detail}
      </span>
    </>
  )

  if (!sessionId) {
    return (
      <div className={tileClass} title={label}>
        {content}
      </div>
    )
  }
  return (
    <Link
      to="/sessions/$sessionId"
      params={{ sessionId }}
      title={label}
      className={`${tileClass} transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY`}
    >
      {content}
    </Link>
  )
}
