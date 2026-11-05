import type { FormEvent } from 'react'
import { Button } from '#/components/ui/button'
import { useMilestoneDraft } from '#/hooks/useMilestoneDraft'
import { useUpdateMilestone } from '#/hooks/useMilestoneMutations'
import { draftFromMilestone, draftToMilestone } from '#/lib/milestones'
import type { Milestone } from '#/types/api'
import { MilestoneFields } from './MilestoneFields'

export function MilestoneEditForm({
  milestone,
  onDone,
}: {
  milestone: Milestone
  onDone: () => void
}) {
  const { draft, update, canSubmit } = useMilestoneDraft(() =>
    draftFromMilestone(milestone),
  )
  const updateMilestone = useUpdateMilestone(milestone.id)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    updateMilestone.mutate(draftToMilestone(draft, new Date(), milestone), {
      onSuccess: onDone,
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <MilestoneFields
        idPrefix={`milestone-${milestone.id}`}
        draft={draft}
        onChange={update}
      />
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!canSubmit || updateMilestone.isPending}
        >
          Save
        </Button>
        <Button type="button" variant="neutral" onClick={onDone}>
          Cancel
        </Button>
      </div>
      {updateMilestone.error && (
        <p className="text-danger">{updateMilestone.error.message}</p>
      )}
    </form>
  )
}
