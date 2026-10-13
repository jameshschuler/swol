import { ChevronRight } from 'lucide-react'
import { formatDate } from '#/lib/format'
import type { LegacyCheckIn } from '#/types/api'

export function LegacyCheckInRow({ checkIn }: { checkIn: LegacyCheckIn }) {
  return (
    <div className="flex items-center gap-3 rounded-base border-2 border-border bg-secondary-background p-3">
      <p className="min-w-0 flex-1 font-heading">
        {formatDate(checkIn.checkedInAt)}
      </p>
      <p className="font-heading tabular-nums">Check-in</p>
      <ChevronRight className="invisible size-4 shrink-0" />
    </div>
  )
}
