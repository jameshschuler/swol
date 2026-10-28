import type { ReactNode } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { Button } from '#/components/ui/button'
import { useDeleteGoal } from '#/hooks/useGoalMutations'

export function GoalRowActions({
  goalId,
  onEdit,
  primaryAction,
}: {
  goalId: string
  onEdit?: () => void
  primaryAction: ReactNode
}) {
  const deleteGoal = useDeleteGoal(goalId)

  return (
    <div className="flex shrink-0 gap-2">
      {primaryAction}
      {onEdit && (
        <Button
          variant="neutral"
          size="icon-sm"
          aria-label="Edit goal"
          title="Edit goal"
          onClick={onEdit}
        >
          <Pencil />
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
