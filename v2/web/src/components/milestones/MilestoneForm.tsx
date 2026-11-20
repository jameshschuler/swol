import type { FormEvent } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Button } from '#/components/ui/button'
import { useMilestoneDraft } from '#/hooks/useMilestoneDraft'
import { useCreateMilestone } from '#/hooks/useMilestoneMutations'
import { draftToMilestone, emptyDraft } from '#/lib/milestones'
import { meQuery } from '#/lib/queries'
import { MilestoneFields } from './MilestoneFields'

export function MilestoneForm({
  exerciseId,
  onDone,
}: {
  exerciseId?: string
  onDone: () => void
}) {
  const { data: me } = useSuspenseQuery(meQuery)
  const { draft, update, canSubmit } = useMilestoneDraft(() =>
    emptyDraft(me.weightUnit, new Date(), exerciseId),
  )
  const createMilestone = useCreateMilestone()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    createMilestone.mutate(draftToMilestone(draft, new Date()), {
      onSuccess: onDone,
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <MilestoneFields idPrefix="milestone" draft={draft} onChange={update} />
      <Button
        type="submit"
        className="self-start"
        disabled={!canSubmit || createMilestone.isPending}
      >
        Log milestone
      </Button>
      {createMilestone.error && (
        <p className="text-danger">{createMilestone.error.message}</p>
      )}
    </form>
  )
}
