import { Pencil, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { FormSheet } from '#/components/shared/FormSheet'
import { Button } from '#/components/ui/button'
import { useDeleteExercise } from '#/hooks/useExerciseMutations'
import type { Exercise } from '#/types/api'
import { ExerciseEditForm } from './ExerciseEditForm'

export function OwnExerciseActions({
  exercise,
  isUsed,
  isBase,
}: {
  exercise: Exercise
  isUsed: boolean
  isBase: boolean
}) {
  const deleteExercise = useDeleteExercise(exercise.id)

  return (
    <>
      <FormSheet
        title="Edit exercise"
        trigger={
          <Button
            variant="neutral"
            size="icon-sm"
            aria-label="Edit exercise"
            title="Edit exercise"
          >
            <Pencil />
          </Button>
        }
      >
        {(close) => <ExerciseEditForm exercise={exercise} onDone={close} />}
      </FormSheet>
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
            disabled={isUsed || deleteExercise.isPending}
          >
            <Trash2 />
          </Button>
        }
      />
    </>
  )
}
