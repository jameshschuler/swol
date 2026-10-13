import { useNow } from '#/hooks/useNow'
import { formatClock } from '#/lib/format'
import { elapsedSeconds } from '#/lib/sessions'
import type { WorkoutSession } from '#/types/api'

export function SessionTimer({ session }: { session: WorkoutSession }) {
  const now = useNow()
  return (
    <p className="font-heading text-5xl tabular-nums md:text-6xl">
      {formatClock(elapsedSeconds(session, now))}
    </p>
  )
}
