import { useState } from 'react'
import { PartyPopper, Trophy } from 'lucide-react'
import { formatDate } from '#/lib/format'
import { formatGoalTarget, goalStatus } from '#/lib/goals'
import type { GoalProgress } from '#/lib/goals'
import { formatLift } from '#/lib/milestones'
import { cn } from '#/lib/utils'
import type { Goal, WeightUnit } from '#/types/api'
import { GoalCompleteButton } from './GoalCompleteButton'
import { GoalEditForm } from './GoalEditForm'
import { GoalReopenButton } from './GoalReopenButton'
import { GoalRowActions } from './GoalRowActions'

const rowClass = 'flex flex-col gap-2 rounded-base border-2 border-border p-3'

export function GoalRow({
  goal,
  progress,
  unit,
}: {
  goal: Goal
  progress: GoalProgress
  unit: WeightUnit
}) {
  const [editing, setEditing] = useState(false)
  const target = formatGoalTarget(goal, unit)
  const { hitBy, completedBy } = progress

  if (editing) {
    return (
      <li className={cn(rowClass, 'bg-secondary-background')}>
        <GoalEditForm goal={goal} onDone={() => setEditing(false)} />
      </li>
    )
  }

  if (goal.completedAt) {
    return (
      <li className={cn(rowClass, 'bg-main text-main-foreground')}>
        <div className="flex items-center gap-3">
          <Trophy className="size-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="font-heading whitespace-nowrap tabular-nums">
              {target}
            </p>
            <p className="text-sm">
              {formatDate(goal.completedAt)}
              {completedBy && ` · ${formatLift(completedBy, unit)}`}
            </p>
          </div>
          <GoalRowActions
            goalId={goal.id}
            primaryAction={<GoalReopenButton goalId={goal.id} />}
          />
        </div>
      </li>
    )
  }

  const status = goalStatus(goal, progress, unit)

  return (
    <li
      className={cn(
        rowClass,
        hitBy ? 'bg-main text-main-foreground' : 'bg-secondary-background',
      )}
    >
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-heading whitespace-nowrap tabular-nums">
            {target}
          </p>
          {status && <p className="text-sm tabular-nums">{status}</p>}
        </div>
        <GoalRowActions
          goalId={goal.id}
          onEdit={() => setEditing(true)}
          primaryAction={
            <GoalCompleteButton
              goalId={goal.id}
              target={target}
              hitBy={hitBy}
              unit={unit}
            />
          }
        />
      </div>
      {hitBy && (
        <p className="flex items-center gap-2 text-sm font-heading">
          <PartyPopper className="size-4" />
          You hit this on {formatDate(hitBy.achievedAt)}
        </p>
      )}
    </li>
  )
}
