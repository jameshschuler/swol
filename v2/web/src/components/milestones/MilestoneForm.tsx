import { useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '#/components/ui/collapsible'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useCreateMilestone } from '#/hooks/useMilestoneMutations'
import { localDateKey, timeForDate } from '#/lib/dates'
import { isCompleteMilestone } from '#/lib/milestones'
import { meQuery } from '#/lib/queries'
import type { WeightUnit } from '#/types/api'
import { ExerciseField } from '#/components/exercises/ExerciseField'
import { RepsField } from '#/components/exercises/RepsField'
import { WeightField } from '#/components/exercises/WeightField'
import { newExerciseId } from '#/components/exercises/exercise-constants'

export function MilestoneForm() {
  const today = localDateKey(new Date())
  const { data: me } = useQuery(meQuery)
  const [exerciseId, setExerciseId] = useState('')
  const [weight, setWeight] = useState('')
  const [chosenUnit, setChosenUnit] = useState<WeightUnit | null>(null)
  const [reps, setReps] = useState('1')
  const [date, setDate] = useState(today)
  const [note, setNote] = useState('')
  const createMilestone = useCreateMilestone()
  const unit = chosenUnit ?? me?.weightUnit ?? 'lb'
  const canSubmit =
    exerciseId !== newExerciseId &&
    isCompleteMilestone({ exerciseId, weight, reps, date })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    createMilestone.mutate(
      {
        exerciseId,
        weight: Number(weight),
        unit,
        reps: Number(reps),
        achievedAt: timeForDate(date, new Date()),
        note,
      },
      {
        onSuccess: () => {
          setExerciseId('')
          setWeight('')
          setChosenUnit(null)
          setReps('1')
          setDate(today)
          setNote('')
        },
      },
    )
  }

  return (
    <Collapsible defaultOpen render={<Card />}>
      <CardHeader>
        <CollapsibleTrigger className="flex w-full items-center justify-between text-left [&[data-panel-open]>svg]:rotate-180">
          <CardTitle>Log a milestone</CardTitle>
          <ChevronDown className="size-5 transition-transform" />
        </CollapsibleTrigger>
      </CardHeader>
      <CollapsibleContent render={<CardContent />}>
        <form onSubmit={submit} className="flex flex-col gap-4">
          <ExerciseField
            id="milestone-exercise"
            value={exerciseId}
            onChange={setExerciseId}
          />
          <WeightField
            id="milestone-weight"
            label="Weight"
            weight={weight}
            onWeightChange={setWeight}
            unit={unit}
            onUnitChange={setChosenUnit}
          />
          <div className="grid grid-cols-2 gap-2">
            <RepsField id="milestone-reps" value={reps} onChange={setReps} />
            <div className="flex flex-col gap-2">
              <Label htmlFor="milestone-date">Date</Label>
              <Input
                id="milestone-date"
                type="date"
                max={today}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="milestone-note">Note</Label>
            <Input
              id="milestone-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Optional"
              maxLength={500}
            />
          </div>
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
