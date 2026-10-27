import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#/components/ui/toast'
import { api } from '#/lib/api'
import { exercisesQuery, milestonesQuery } from '#/lib/queries'
import type { Exercise, Milestone, WeightUnit } from '#/types/api'

export interface NewMilestone {
  exerciseId: string
  weight: number
  unit: WeightUnit
  reps: number
  achievedAt: string
  note: string
}

function useInvalidateMilestones() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: milestonesQuery.queryKey })
}

export function useCreateMilestone() {
  const invalidate = useInvalidateMilestones()
  return useMutation({
    mutationFn: (milestone: NewMilestone) =>
      api<Omit<Milestone, 'exerciseName'>>('/milestones', {
        method: 'POST',
        body: JSON.stringify(milestone),
      }),
    onSuccess: () => {
      toast.add({ title: 'Milestone logged', type: 'success' })
      return invalidate()
    },
  })
}

export function useDeleteMilestone() {
  const onSuccess = useInvalidateMilestones()
  return useMutation({
    mutationFn: (id: string) =>
      api<void>(`/milestones/${id}`, { method: 'DELETE' }),
    onSuccess,
  })
}

export function useCreateExercise() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (name: string) =>
      api<Exercise>('/exercises', {
        method: 'POST',
        body: JSON.stringify({ name }),
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
