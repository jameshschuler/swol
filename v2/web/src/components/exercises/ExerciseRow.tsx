import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { Button } from '#/components/ui/button'
import { useDeleteExercise } from '#/hooks/useExerciseMutations'
import { cn } from '#/lib/utils'
import type { Exercise } from '#/types/api'
import { ExerciseEditForm } from './ExerciseEditForm'

const rowClass =
  'rounded-base border-2 border-border bg-secondary-background p-3'

export function ExerciseRow({
  exercise,
  baseExerciseName,
  usage,
  isBase,
}: {
  exercise: Exercise
  baseExerciseName: string | undefined
  usage: string | null
  isBase: boolean
}) {
  const [editing, setEditing] = useState(false)
  const deleteExercise = useDeleteExercise(exercise.id)

  if (editing) {
    return (
      <li className={rowClass}>
        <ExerciseEditForm
          exercise={exercise}
          onDone={() => setEditing(false)}
        />
      </li>
    )
  }

  return (
    <li className={cn(rowClass, 'flex items-start gap-3')}>
      <div className="min-w-0 flex-1">
        <p className="truncate font-heading">{exercise.name}</p>
        {baseExerciseName && (
          <p className="truncate text-sm">Variation of {baseExerciseName}</p>
        )}
        {usage && <p className="text-sm">{usage}</p>}
      </div>
      <Button
        variant="neutral"
        size="icon-sm"
        aria-label="Edit exercise"
        title="Edit exercise"
        onClick={() => setEditing(true)}
      >
        <Pencil />
      </Button>
      <ConfirmDialog
        title={`Delete ${exercise.name}?`}
        description={
          isBase
            ? "It's removed for good. Its variations become exercises of their own."
            : "It's removed for good."
        }
        confirmLabel="Delete"
        onConfirm={() => deleteExercise.mutate()}
        trigger={
          <Button
            variant="neutral"
            size="icon-sm"
            aria-label="Delete exercise"
            title="Delete exercise"
            disabled={usage !== null || deleteExercise.isPending}
          >
            <Trash2 />
          </Button>
        }
      />
    </li>
  )
}
