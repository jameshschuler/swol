import { displayWeight } from '#/lib/milestones'
import { formatWeight } from '#/lib/units'
import { cn } from '#/lib/utils'
import type { Milestone, WeightUnit } from '#/types/api'

export function TotalBreakdown({
  bests,
  unit,
}: {
  bests: Milestone[]
  unit: WeightUnit
}) {
  return (
    <dl
      className={cn(
        'grid gap-2',
        bests.length === 3 ? 'grid-cols-3' : 'grid-cols-2',
      )}
    >
      {bests.map((best) => (
        <div
          key={best.id}
          className="min-w-0 rounded-base border-2 border-border bg-background p-2"
        >
          <dt className="truncate text-xs">{best.exerciseName}</dt>
          <dd className="font-heading whitespace-nowrap tabular-nums">
            {formatWeight(displayWeight(best, unit), unit)}
          </dd>
        </div>
      ))}
    </dl>
  )
}
