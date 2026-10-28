import { createFileRoute } from '@tanstack/react-router'
import { GoalForm } from '#/components/goals/GoalForm'
import { GoalList } from '#/components/goals/GoalList'
import { PageHeader } from '#/components/shared/PageHeader'

export const Route = createFileRoute('/_app/goals')({
  component: Goals,
})

function Goals() {
  return (
    <>
      <PageHeader title="Goals" description="Targets to chase." />
      <div className="flex flex-col gap-6">
        <GoalForm />
        <GoalList />
      </div>
    </>
  )
}
