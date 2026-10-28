import { useState } from 'react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useCreateExercise } from '#/hooks/useMilestoneMutations'

export function NewExerciseForm({
  onCreated,
}: {
  onCreated: (exerciseId: string) => void
}) {
  const [name, setName] = useState('')
  const createExercise = useCreateExercise()

  const add = () => {
    createExercise.mutate(name.trim(), {
      onSuccess: (exercise) => onCreated(exercise.id),
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
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
        <Button
          type="button"
          variant="neutral"
          disabled={!name.trim() || createExercise.isPending}
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
