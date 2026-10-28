import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#/components/ui/toast'
import { api } from '#/lib/api'
import { goalsQuery } from '#/lib/queries'
import type { WeightUnit } from '#/types/api'

export interface NewGoal {
  exerciseId: string
  targetWeight: number
  unit: WeightUnit
  targetReps: number
}

function useInvalidateGoals() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: goalsQuery.queryKey })
}

export function useCreateGoal() {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: (goal: NewGoal) =>
      api<unknown>('/goals', { method: 'POST', body: JSON.stringify(goal) }),
    onSuccess: () => {
      toast.add({ title: 'Goal set', type: 'success' })
      return invalidate()
    },
  })
}

export function useUpdateGoal(goalId: string) {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: (target: Omit<NewGoal, 'exerciseId'>) =>
      api<unknown>(`/goals/${goalId}`, {
        method: 'PATCH',
        body: JSON.stringify(target),
      }),
    onSuccess: () => {
      toast.add({ title: 'Goal updated', type: 'success' })
      return invalidate()
    },
  })
}

export function useCompleteGoal(goalId: string) {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: (milestoneId: string | null) =>
      api<unknown>(`/goals/${goalId}/complete`, {
        method: 'POST',
        body: JSON.stringify(milestoneId ? { milestoneId } : {}),
      }),
    onSuccess: () => {
      toast.add({ title: 'Goal complete', type: 'success' })
      return invalidate()
    },
    onError: (error) =>
      toast.add({
        title: "Couldn't complete goal",
        description: error.message,
      }),
  })
}

export function useReopenGoal(goalId: string) {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: () =>
      api<unknown>(`/goals/${goalId}/reopen`, { method: 'POST' }),
    onSuccess: () => {
      toast.add({ title: 'Goal reopened', type: 'success' })
      return invalidate()
    },
    onError: (error) =>
      toast.add({ title: "Couldn't reopen goal", description: error.message }),
  })
}

export function useDeleteGoal(goalId: string) {
  const invalidate = useInvalidateGoals()
  return useMutation({
    mutationFn: () => api<void>(`/goals/${goalId}`, { method: 'DELETE' }),
    onSuccess: invalidate,
    onError: (error) =>
      toast.add({ title: "Couldn't delete goal", description: error.message }),
  })
}
