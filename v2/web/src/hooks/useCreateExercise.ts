import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { exercisesQuery } from '#/lib/queries'
import type { Exercise } from '#/types/api'

export interface NewExercise {
  name: string
  baseExerciseId: string | null
}

export function useCreateExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (exercise: NewExercise) =>
      api<Exercise>('/exercises', {
        method: 'POST',
        body: JSON.stringify(exercise),
      }),
    onSuccess: (exercise) => {
      queryClient.setQueryData(exercisesQuery.queryKey, (exercises = []) => [
        ...exercises,
        exercise,
      ])
      return queryClient.invalidateQueries({
        queryKey: exercisesQuery.queryKey,
      })
    },
  })
}
