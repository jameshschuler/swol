import type { FormEvent } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'
import { useMilestoneDraft } from '#/hooks/useMilestoneDraft'
import { useCreateMilestone } from '#/hooks/useMilestoneMutations'
import { draftToMilestone, emptyDraft } from '#/lib/milestones'
import { meQuery, milestonesQuery } from '#/lib/queries'
import { MilestoneFields } from './MilestoneFields'

export function MilestoneForm() {
  const { data: me } = useSuspenseQuery(meQuery)
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const { draft, update, reset, canSubmit } = useMilestoneDraft(() =>
    emptyDraft(me.weightUnit, new Date()),
  )
  const createMilestone = useCreateMilestone()

  const submit = (event: FormEvent) => {
    event.preventDefault()
    createMilestone.mutate(draftToMilestone(draft, new Date()), {
      onSuccess: reset,
    })
  }

  return (
    <Collapsible defaultOpen={milestones.length === 0} render={<Card />}>
      <CardHeader>
        <CollapsibleTrigger className="flex w-full items-center justify-between rounded-base text-left focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none [&[data-panel-open]>svg]:rotate-180">
          <CardTitle>Log a milestone</CardTitle>
          <ChevronDown className="size-5 transition-transform" />
        </CollapsibleTrigger>
      </CardHeader>
      <CollapsibleContent render={<CardContent />}>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <MilestoneFields
            idPrefix="milestone"
            draft={draft}
            onChange={update}
          />
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
      </CollapsibleContent>
    </Collapsible>
  )
}
