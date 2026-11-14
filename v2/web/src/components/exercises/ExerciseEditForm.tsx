import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { useUpdateExercise } from '#/hooks/useExerciseMutations'
import { hasVariations } from '#/lib/exercises'
import { exercisesQuery } from '#/lib/queries'
import type { Exercise } from '#/types/api'
import { BaseExerciseField } from './BaseExerciseField'

export function ExerciseEditForm({
  exercise,
  onDone,
}: {
  exercise: Exercise
  onDone: () => void
}) {
  const [name, setName] = useState(exercise.name)
  const [baseExerciseId, setBaseExerciseId] = useState(exercise.baseExerciseId)
  const nameId = useId()
  const baseFieldId = useId()
  const { data: exercises = [] } = useQuery(exercisesQuery)
  const updateExercise = useUpdateExercise(exercise.id)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    updateExercise.mutate(
      { name: name.trim(), baseExerciseId },
      { onSuccess: onDone },
    )
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={100}
        />
      </div>
      {!hasVariations(exercise.id, exercises) && (
        <BaseExerciseField
          id={baseFieldId}
          exerciseId={exercise.id}
          value={baseExerciseId}
          onChange={setBaseExerciseId}
        />
      )}
      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={name.trim() === '' || updateExercise.isPending}
        >
          Save
        </Button>
        <Button type="button" variant="neutral" onClick={onDone}>
          Cancel
        </Button>
      </div>
      {updateExercise.error && (
        <p className="text-danger">{updateExercise.error.message}</p>
      )}
    </form>
  )
}
