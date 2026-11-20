import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { MilestoneForm } from '#/components/milestones/MilestoneForm'
import { MilestoneList } from '#/components/milestones/MilestoneList'
import { FormSheet } from '#/components/shared/FormSheet'
import { PageHeader } from '#/components/shared/PageHeader'
import { PageLoadError } from '#/components/shared/PageLoadError'
import { TotalsSection } from '#/components/totals/TotalsSection'
import { Button } from '#/components/ui/button'
import { meQuery, milestonesQuery } from '#/lib/queries'

export const Route = createFileRoute('/_app/milestones')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.query({ ...meQuery, staleTime: 'static' }),
      queryClient.query({ ...milestonesQuery, staleTime: 'static' }),
    ]),
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: PageLoadError,
  component: Milestones,
})

function Milestones() {
  return (
    <>
      <PageHeader
        title="Milestones"
        description="Your personal records."
        action={
          <FormSheet
            title="Log a milestone"
            trigger={
              <Button>
                <Plus />
                Log milestone
              </Button>
            }
          >
            {(close) => <MilestoneForm onDone={close} />}
          </FormSheet>
        }
      />
      <div className="flex flex-col gap-6">
        <TotalsSection />
        <MilestoneList />
      </div>
    </>
  )
}
