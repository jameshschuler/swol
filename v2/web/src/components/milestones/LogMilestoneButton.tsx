import { Plus } from 'lucide-react'
import { FormSheet } from '#/components/shared/FormSheet'
import { Button } from '#/components/ui/button'
import { MilestoneForm } from './MilestoneForm'

export function LogMilestoneButton({ exerciseId }: { exerciseId?: string }) {
  return (
    <FormSheet
      title="Log a milestone"
      trigger={
        <Button>
          <Plus />
          Log milestone
        </Button>
      }
    >
      {(close) => <MilestoneForm exerciseId={exerciseId} onDone={close} />}
    </FormSheet>
  )
}
