import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ExerciseField } from '#/components/exercises/ExerciseField'
import { RepsField } from '#/components/exercises/RepsField'
import { WeightField } from '#/components/exercises/WeightField'
import { newExerciseId } from '#/components/exercises/exercise-constants'
import { Button } from '#/components/ui/button'
import { useCreateGoal } from '#/hooks/useGoalMutations'
import { isValidLift } from '#/lib/lifts'
import { meQuery } from '#/lib/queries'
import type { WeightUnit } from '#/types/api'

export function GoalForm({ onDone }: { onDone: () => void }) {
  const { data: me } = useQuery(meQuery)
  const [exerciseId, setExerciseId] = useState('')
  const [weight, setWeight] = useState('')
  const [chosenUnit, setChosenUnit] = useState<WeightUnit | null>(null)
  const [reps, setReps] = useState('1')
  const createGoal = useCreateGoal()
  const unit = chosenUnit ?? me?.weightUnit ?? 'lb'
  const canSubmit =
    exerciseId !== '' &&
    exerciseId !== newExerciseId &&
    isValidLift(weight, reps)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    createGoal.mutate(
      {
        exerciseId,
        targetWeight: Number(weight),
        unit,
        targetReps: Number(reps),
      },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <ExerciseField
        id="goal-exercise"
        value={exerciseId}
        onChange={setExerciseId}
      />
      <WeightField
        id="goal-weight"
        label="Target weight"
        weight={weight}
        onWeightChange={setWeight}
        unit={unit}
        onUnitChange={setChosenUnit}
      />
      <RepsField id="goal-reps" value={reps} onChange={setReps} />
      <Button
        type="submit"
        className="self-start"
        disabled={!canSubmit || createGoal.isPending}
      >
        Set goal
      </Button>
      {createGoal.error && (
        <p className="text-danger">{createGoal.error.message}</p>
      )}
    </form>
  )
}
