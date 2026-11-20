import type { ReactNode } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { FormSheet } from '#/components/shared/FormSheet'
import { Button } from '#/components/ui/button'
import { useDeleteGoal } from '#/hooks/useGoalMutations'
import type { Goal } from '#/types/api'
import { GoalEditForm } from './GoalEditForm'

export function GoalRowActions({
  goal,
  primaryAction,
}: {
  goal: Goal
  primaryAction: ReactNode
}) {
  const deleteGoal = useDeleteGoal(goal.id)

  return (
    <div className="flex shrink-0 gap-2">
      {primaryAction}
      {!goal.completedAt && (
        <FormSheet
          title="Edit goal"
          trigger={
            <Button
              variant="neutral"
              size="icon-sm"
              aria-label="Edit goal"
              title="Edit goal"
            >
              <Pencil />
            </Button>
          }
        >
          {(close) => <GoalEditForm goal={goal} onDone={close} />}
        </FormSheet>
      )}
      <ConfirmDialog
        title="Delete this goal?"
        description="It's removed for good. Your milestones aren't affected."
        confirmLabel="Delete"
        onConfirm={() => deleteGoal.mutate()}
        trigger={
          <Button
            variant="neutral"
            size="icon-sm"
            aria-label="Delete goal"
            title="Delete goal"
            disabled={deleteGoal.isPending}
          >
            <Trash2 />
          </Button>
        }
      />
    </div>
  )
}
