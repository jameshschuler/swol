import { useId, useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useCreateExercise } from '#/hooks/useCreateExercise'
import { BaseExerciseField } from './BaseExerciseField'

export function NewExerciseForm({
  onCreated,
}: {
  onCreated: (exerciseId: string) => void
}) {
  const [name, setName] = useState('')
  const [baseExerciseId, setBaseExerciseId] = useState<string | null>(null)
  const baseFieldId = useId()
  const createExercise = useCreateExercise()

  const canAdd = name.trim() !== '' && !createExercise.isPending

  const add = () => {
    if (!canAdd) {
      return
    }
    createExercise.mutate(
      { name: name.trim(), baseExerciseId },
      { onSuccess: (exercise) => onCreated(exercise.id) },
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            add()
          }
        }}
        placeholder="New exercise name"
        aria-label="New exercise name"
        maxLength={100}
      />
      <div className="grid grid-cols-[1fr_auto] items-end gap-2">
        <BaseExerciseField
          id={baseFieldId}
          value={baseExerciseId}
          onChange={setBaseExerciseId}
        />
        <Button
          type="button"
          variant="neutral"
          disabled={!canAdd}
          onClick={add}
        >
          Add
        </Button>
      </div>
      {createExercise.error && (
        <p className="text-danger">{createExercise.error.message}</p>
      )}
    </div>
  )
}
