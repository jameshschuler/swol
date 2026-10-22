import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { heatmapWeeks } from '#/lib/stats'
import { localDateKey } from '#/lib/dates'
import { formatDate } from '#/lib/format'
import { cn } from '#/lib/utils'

export function VisitsHeatmap({ days, now }: { days: Set<string>; now: Date }) {
  const todayKey = localDateKey(now)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last 12 months</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex gap-0.5 overflow-x-auto pb-1" dir="rtl">
          <div className="flex gap-0.5" dir="ltr">
            {heatmapWeeks(now, 53).map((week) => (
              <div
                key={localDateKey(week[0])}
                className="flex flex-col gap-0.5"
              >
                {week.map((date) => {
                  const key = localDateKey(date)
                  const visited = days.has(key)
                  const label = `${formatDate(date.toISOString())}: ${visited ? 'went' : 'no visit'}`
                  return (
                    <div
                      key={key}
                      title={label}
                      aria-label={label}
                      className={cn(
                        'size-3 rounded-[2px] border',
                        visited
                          ? 'border-border bg-main'
                          : 'border-border/20 bg-secondary-background',
                        key > todayKey && 'invisible',
                      )}
                    />
                  )
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-[2px] border border-border/20 bg-secondary-background" />
            No visit
          </span>
          <span className="flex items-center gap-1">
            <span className="size-3 rounded-[2px] border border-border bg-main" />
            Went
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
