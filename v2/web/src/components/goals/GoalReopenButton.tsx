import { Undo2 } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { Button } from '#/components/ui/button'
import { useReopenGoal } from '#/hooks/useGoalMutations'

export function GoalReopenButton({ goalId }: { goalId: string }) {
  const reopenGoal = useReopenGoal(goalId)

  return (
    <ConfirmDialog
      title="Reopen this goal?"
      description="It moves back to Open, and its completion date and lift are cleared."
      confirmLabel="Reopen"
      onConfirm={() => reopenGoal.mutate()}
      trigger={
        <Button
          variant="neutral"
          size="icon-sm"
          aria-label="Reopen goal"
          title="Reopen goal"
          disabled={reopenGoal.isPending}
        >
          <Undo2 />
        </Button>
      }
    />
  )
}
