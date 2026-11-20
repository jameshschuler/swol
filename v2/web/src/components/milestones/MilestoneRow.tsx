import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { FormSheet } from '#/components/shared/FormSheet'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { useDeleteMilestone } from '#/hooks/useMilestoneMutations'
import { formatDate } from '#/lib/format'
import { formatLiftWithRpe } from '#/lib/milestones'
import type { PersonalRecord } from '#/lib/milestones'
import type { Milestone, WeightUnit } from '#/types/api'
import { MilestoneEditForm } from './MilestoneEditForm'

export function MilestoneRow({
  milestone,
  unit,
  record,
}: {
  milestone: Milestone
  unit: WeightUnit
  record: PersonalRecord | undefined
}) {
  const deleteMilestone = useDeleteMilestone()

  return (
    <li className="flex items-start gap-3 rounded-base border-2 border-border bg-secondary-background p-3">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-heading tabular-nums">
          {formatLiftWithRpe(milestone, unit)}
          {record && (
            <Badge className="bg-main text-main-foreground">
              {record === 'weight' ? 'Weight PR' : 'Rep PR'}
            </Badge>
          )}
        </p>
        <p className="text-sm">{formatDate(milestone.achievedAt)}</p>
        {milestone.note && (
          <p className="mt-1 text-sm break-words">{milestone.note}</p>
        )}
      </div>
      <FormSheet
        title="Edit milestone"
        trigger={
          <Button
            variant="neutral"
            size="icon-sm"
            aria-label="Edit milestone"
            title="Edit milestone"
          >
            <Pencil />
          </Button>
        }
      >
        {(close) => <MilestoneEditForm milestone={milestone} onDone={close} />}
      </FormSheet>
      <ConfirmDialog
        title="Delete this milestone?"
        description="It's removed from your records for good."
        confirmLabel="Delete"
        onConfirm={() => deleteMilestone.mutate(milestone.id)}
        trigger={
          <Button
            variant="neutral"
            size="icon-sm"
            aria-label="Delete milestone"
            disabled={deleteMilestone.isPending}
          >
            <Trash2 />
          </Button>
        }
      />
    </li>
  )
}
