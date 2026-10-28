import { Trophy } from 'lucide-react'
import { formatDate } from '#/lib/format'
import { displayWeight } from '#/lib/milestones'
import { formatWeight } from '#/lib/units'
import type { Milestone, WeightUnit } from '#/types/api'

export function GoalCompleteBanner({
  completedAt,
  completedBy,
  unit,
}: {
  completedAt: string
  completedBy: Milestone | null
  unit: WeightUnit
}) {
  const lift = completedBy
    ? ` · ${formatWeight(displayWeight(completedBy, unit), unit)} × ${completedBy.reps}`
    : ''

  return (
    <div className="flex items-center gap-3 rounded-base border-2 border-border bg-main p-3 text-main-foreground">
      <Trophy className="size-6 shrink-0" />
      <div>
        <p className="font-heading">Goal complete</p>
        <p className="text-sm">
          {formatDate(completedAt)}
          {lift}
        </p>
      </div>
    </div>
  )
}
