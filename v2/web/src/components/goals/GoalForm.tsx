import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { ExerciseField } from '#/components/exercises/ExerciseField'
import { RepsField } from '#/components/exercises/RepsField'
import { WeightField } from '#/components/exercises/WeightField'
import { newExerciseId } from '#/components/exercises/exercise-constants'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'
import { useCreateGoal } from '#/hooks/useGoalMutations'
import { isValidLift } from '#/lib/lifts'
import { meQuery } from '#/lib/queries'
import type { WeightUnit } from '#/types/api'

export function GoalForm() {
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
      {
        onSuccess: () => {
          setExerciseId('')
          setWeight('')
          setChosenUnit(null)
          setReps('1')
        },
      },
    )
  }

  return (
    <Collapsible defaultOpen render={<Card />}>
      <CardHeader>
        <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-panel-open]>svg]:rotate-180">
          <CardTitle>Set a goal</CardTitle>
          <ChevronDown className="size-5 transition-transform" />
        </CollapsibleTrigger>
      </CardHeader>
      <CollapsibleContent render={<CardContent />}>
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
      </CollapsibleContent>
    </Collapsible>
  )
}
