import { Link } from '@tanstack/react-router'
import { ChevronRight } from 'lucide-react'
import { formatDate, formatDuration, formatTime } from '#/lib/format'
import { elapsedSeconds } from '#/lib/sessions'
import type { WorkoutSession } from '#/types/api'

export function SessionHistoryRow({ session }: { session: WorkoutSession }) {
  return (
    <Link
      to="/sessions/$sessionId"
      params={{ sessionId: session.id }}
      className="flex items-center gap-3 rounded-base border-2 border-border bg-secondary-background p-3 transition-all hover:translate-x-boxShadowX hover:translate-y-boxShadowY"
    >
      <div className="min-w-0 flex-1">
        <p className="font-heading">{formatDate(session.startedAt)}</p>
        {session.kind === 'workout' && (
          <p className="text-sm">{formatTime(session.startedAt)}</p>
        )}
      </div>
      <p className="font-heading tabular-nums">
        {session.kind === 'check_in'
          ? 'Check-in'
          : formatDuration(elapsedSeconds(session, Date.now()))}
      </p>
      <ChevronRight className="size-4 shrink-0" />
    </Link>
  )
}
