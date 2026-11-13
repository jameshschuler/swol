import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#/components/ui/toast'
import { api } from '#/lib/api'
import { exercisesQuery, goalsQuery, milestonesQuery } from '#/lib/queries'
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

function useInvalidateExerciseNames() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all(
      [exercisesQuery, milestonesQuery, goalsQuery].map(({ queryKey }) =>
        queryClient.invalidateQueries({ queryKey }),
      ),
    )
}

export function useUpdateExercise(id: string) {
  const invalidate = useInvalidateExerciseNames()
  return useMutation({
    mutationFn: (exercise: NewExercise) =>
      api<Exercise>(`/exercises/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(exercise),
      }),
    onSuccess: () => {
      toast.add({ title: 'Exercise updated', type: 'success' })
      return invalidate()
    },
  })
}

export function useDeleteExercise(id: string) {
  const onSuccess = useInvalidateExerciseNames()
  return useMutation({
    mutationFn: () => api<void>(`/exercises/${id}`, { method: 'DELETE' }),
    onSuccess,
    onError: (error) =>
      toast.add({
        title: "Couldn't delete exercise",
        description: error.message,
      }),
  })
}
