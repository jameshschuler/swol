import { useState } from 'react'
import type { FormEvent } from 'react'
import { RepsField } from '#/components/exercises/RepsField'
import { WeightField } from '#/components/exercises/WeightField'
import { Button } from '#/components/ui/button'
import { useUpdateGoal } from '#/hooks/useGoalMutations'
import { isValidLift } from '#/lib/lifts'
import type { Goal } from '#/types/api'

export function GoalEditForm({
  goal,
  onDone,
}: {
  goal: Goal
  onDone: () => void
}) {
  const [weight, setWeight] = useState(String(goal.targetWeight))
  const [unit, setUnit] = useState(goal.unit)
  const [reps, setReps] = useState(String(goal.targetReps))
  const updateGoal = useUpdateGoal(goal.id)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    updateGoal.mutate(
      { targetWeight: Number(weight), unit, targetReps: Number(reps) },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <WeightField
        id={`goal-${goal.id}-weight`}
        label="Target weight"
        weight={weight}
        onWeightChange={setWeight}
        unit={unit}
        onUnitChange={setUnit}
      />
      <RepsField id={`goal-${goal.id}-reps`} value={reps} onChange={setReps} />
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={!isValidLift(weight, reps) || updateGoal.isPending}
        >
          Save
        </Button>
        <Button type="button" variant="neutral" onClick={onDone}>
          Cancel
        </Button>
      </div>
      {updateGoal.error && (
        <p className="text-danger">{updateGoal.error.message}</p>
      )}
    </form>
  )
}
