import { createFileRoute } from '@tanstack/react-router'
import { MilestoneForm } from '#/components/milestones/MilestoneForm'
import { MilestoneList } from '#/components/milestones/MilestoneList'
import { PageHeader } from '#/components/shared/PageHeader'

export const Route = createFileRoute('/_app/milestones')({
  component: Milestones,
})

function Milestones() {
  return (
    <>
      <PageHeader title="Milestones" description="Your personal records." />
      <div className="flex flex-col gap-6">
        <MilestoneForm />
        <MilestoneList />
      </div>
    </>
  )
}
