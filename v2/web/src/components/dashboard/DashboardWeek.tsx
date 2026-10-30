import { useSuspenseQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { localDateKey } from '#/lib/dates'
import { formatShortWeekday, formatWeeks } from '#/lib/format'
import { legacyCheckInsQuery, sessionsQuery } from '#/lib/queries'
import {
  heatmapWeeks,
  visitDays,
  visitsPerWeek,
  weekStreaks,
} from '#/lib/stats'
import { cn } from '#/lib/utils'

export function DashboardWeek() {
  const { data: sessions } = useSuspenseQuery(sessionsQuery)
  const { data: legacyCheckIns } = useSuspenseQuery(legacyCheckInsQuery)
  const now = new Date()
  const todayKey = localDateKey(now)
  const days = visitDays(sessions, legacyCheckIns)
  const visits = visitsPerWeek(days, now, 1)[0].visits
  const streak = weekStreaks(days, now).current

  return (
    <Card>
      <CardHeader>
        <CardTitle>This week</CardTitle>
        <CardAction className="text-sm">
          Streak: {formatWeeks(streak)}
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ol className="grid grid-cols-7 gap-1.5">
          {heatmapWeeks(now, 1)[0].map((date) => {
            const key = localDateKey(date)
            const visited = days.has(key)
            return (
              <li key={key} className="flex flex-col items-center gap-1">
                <span
                  className={cn('text-xs', key === todayKey && 'font-heading')}
                >
                  {formatShortWeekday(date)}
                </span>
                <span
                  aria-label={visited ? 'Went' : 'No visit'}
                  className={cn(
                    'flex aspect-square w-full max-w-10 items-center justify-center rounded-base border-2 border-border',
                    visited
                      ? 'bg-main text-main-foreground'
                      : 'bg-secondary-background',
                    key > todayKey && 'border-dashed opacity-50',
                  )}
                >
                  {visited && <Check className="size-4" />}
                </span>
              </li>
            )
          })}
        </ol>
        <p className="font-heading">
          {visits} {visits === 1 ? 'visit' : 'visits'} this week
        </p>
      </CardContent>
    </Card>
  )
}
