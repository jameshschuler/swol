import { Check } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { Button } from '#/components/ui/button'
import { useCompleteGoal } from '#/hooks/useGoalMutations'
import { formatDate } from '#/lib/format'
import { formatLift } from '#/lib/milestones'
import type { Milestone, WeightUnit } from '#/types/api'

export function GoalCompleteButton({
  goalId,
  target,
  hitBy,
  unit,
}: {
  goalId: string
  target: string
  hitBy: Milestone | null
  unit: WeightUnit
}) {
  const completeGoal = useCompleteGoal(goalId)

  return (
    <ConfirmDialog
      title="Mark this goal complete?"
      description={
        hitBy
          ? `${formatLift(hitBy, unit)} on ${formatDate(hitBy.achievedAt)} meets ${target}.`
          : `No logged lift meets ${target} yet. Mark it complete anyway?`
      }
      confirmLabel="Mark complete"
      onConfirm={() => completeGoal.mutate(hitBy?.id ?? null)}
      trigger={
        <Button
          variant="neutral"
          size="icon-sm"
          aria-label="Mark goal complete"
          title="Mark complete"
          disabled={completeGoal.isPending}
        >
          <Check />
        </Button>
      }
    />
  )
}
