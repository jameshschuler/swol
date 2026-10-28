import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#/components/ui/toast'
import { api } from '#/lib/api'
import { goalsNewlyHit } from '#/lib/goals'
import { goalsQuery, milestonesQuery } from '#/lib/queries'
import type { Milestone, WeightUnit } from '#/types/api'

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
  const queryClient = useQueryClient()
  const invalidate = useInvalidateMilestones()
  return useMutation({
    mutationFn: (milestone: NewMilestone) =>
      api<Omit<Milestone, 'exerciseName'>>('/milestones', {
        method: 'POST',
        body: JSON.stringify(milestone),
      }),
    onSuccess: (milestone) => {
      toast.add({ title: 'Milestone logged', type: 'success' })
      const previous = queryClient.getQueryData(milestonesQuery.queryKey) ?? []
      void queryClient
        .ensureQueryData(goalsQuery)
        .then((goals) => {
          const hit = goalsNewlyHit(milestone, goals, previous)
          if (hit.length > 0) {
            toast.add({
              title: hit.length === 1 ? 'You hit a goal!' : 'You hit goals!',
              description: `${hit.map((goal) => goal.exerciseName).join(', ')}: mark complete on the Goals page.`,
              type: 'success',
            })
          }
        })
        .catch(() => undefined)
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
