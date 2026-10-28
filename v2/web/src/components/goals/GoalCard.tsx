import { useState } from 'react'
import { Pencil, PartyPopper, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { useCompleteGoal, useDeleteGoal } from '#/hooks/useGoalMutations'
import { formatDate } from '#/lib/format'
import { displayTarget } from '#/lib/goals'
import type { GoalProgress } from '#/lib/goals'
import { displayWeight } from '#/lib/milestones'
import { formatWeight } from '#/lib/units'
import type { Goal, WeightUnit } from '#/types/api'
import { GoalCompleteBanner } from './GoalCompleteBanner'
import { GoalEditForm } from './GoalEditForm'

export function GoalCard({
  goal,
  progress,
  unit,
}: {
  goal: Goal
  progress: GoalProgress
  unit: WeightUnit
}) {
  const [editing, setEditing] = useState(false)
  const completeGoal = useCompleteGoal(goal.id)
  const deleteGoal = useDeleteGoal(goal.id)
  const target = `${formatWeight(displayTarget(goal, unit), unit)} × ${goal.targetReps}`
  const { best, percent, hitBy } = progress

  return (
    <Card>
      <CardHeader>
        <CardTitle>{goal.exerciseName}</CardTitle>
        <CardAction className="font-heading tabular-nums">{target}</CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {editing ? (
          <GoalEditForm goal={goal} onDone={() => setEditing(false)} />
        ) : goal.completedAt ? (
          <GoalCompleteBanner
            completedAt={goal.completedAt}
            completedBy={progress.completedBy}
            unit={unit}
          />
        ) : (
          <>
            <div
              role="progressbar"
              aria-label={`Progress toward ${target}`}
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              className="h-3 overflow-hidden rounded-base border-2 border-border bg-secondary-background"
            >
              <div
                className="h-full bg-main"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="text-sm">
              {best
                ? `Best: ${formatWeight(displayWeight(best, unit), unit)} × ${best.reps} (${percent}%)`
                : goal.targetReps === 1
                  ? 'No lifts logged yet.'
                  : `No lifts with ${goal.targetReps}+ reps yet.`}
            </p>
            {hitBy && (
              <div className="flex flex-col gap-2 rounded-base border-2 border-border bg-main p-3 text-main-foreground">
                <p className="flex items-center gap-2 font-heading">
                  <PartyPopper className="size-4" />
                  You hit this on {formatDate(hitBy.achievedAt)}
                </p>
                <ConfirmDialog
                  title="Mark this goal complete?"
                  description={`${formatWeight(displayWeight(hitBy, unit), unit)} × ${hitBy.reps} on ${formatDate(hitBy.achievedAt)} meets ${target}.`}
                  confirmLabel="Mark complete"
                  onConfirm={() => completeGoal.mutate(hitBy.id)}
                  trigger={
                    <Button
                      variant="neutral"
                      className="self-start"
                      disabled={completeGoal.isPending}
                    >
                      Mark complete
                    </Button>
                  }
                />
              </div>
            )}
          </>
        )}
        {!editing && (
          <div className="flex justify-end gap-3">
            {!goal.completedAt && (
              <Button
                variant="neutral"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil />
                Edit
              </Button>
            )}
            <ConfirmDialog
              title="Delete this goal?"
              description="It's removed for good. Your milestones aren't affected."
              confirmLabel="Delete"
              onConfirm={() => deleteGoal.mutate()}
              trigger={
                <Button
                  variant="neutral"
                  size="sm"
                  disabled={deleteGoal.isPending}
                >
                  <Trash2 />
                  Delete
                </Button>
              }
            />
          </div>
        )}
        {(completeGoal.error ?? deleteGoal.error) && (
          <p className="text-danger">
            {(completeGoal.error ?? deleteGoal.error)?.message}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
