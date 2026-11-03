import { createFileRoute } from '@tanstack/react-router'
import { MilestoneForm } from '#/components/milestones/MilestoneForm'
import { MilestoneList } from '#/components/milestones/MilestoneList'
import { PageHeader } from '#/components/shared/PageHeader'
import { PageLoadError } from '#/components/shared/PageLoadError'
import { TotalsSection } from '#/components/totals/TotalsSection'
import { meQuery, milestonesQuery } from '#/lib/queries'

export const Route = createFileRoute('/_app/milestones')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(meQuery),
      queryClient.ensureQueryData(milestonesQuery),
    ]),
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: PageLoadError,
  component: Milestones,
})

function Milestones() {
  return (
    <>
      <PageHeader title="Milestones" description="Your personal records." />
      <div className="flex flex-col gap-6">
        <MilestoneForm />
        <TotalsSection />
        <MilestoneList />
      </div>
    </>
  )
}
