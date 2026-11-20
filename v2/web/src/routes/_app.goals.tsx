import { createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { GoalForm } from '#/components/goals/GoalForm'
import { GoalList } from '#/components/goals/GoalList'
import { FormSheet } from '#/components/shared/FormSheet'
import { PageHeader } from '#/components/shared/PageHeader'
import { Button } from '#/components/ui/button'

export const Route = createFileRoute('/_app/goals')({
  component: Goals,
})

function Goals() {
  return (
    <>
      <PageHeader
        title="Goals"
        description="Targets to chase."
        action={
          <FormSheet
            title="Set a goal"
            trigger={
              <Button>
                <Plus />
                Set goal
              </Button>
            }
          >
            {(close) => <GoalForm onDone={close} />}
          </FormSheet>
        }
      />
      <div className="flex flex-col gap-6">
        <GoalList />
      </div>
    </>
  )
}
