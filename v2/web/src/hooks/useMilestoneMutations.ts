import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '#/components/ui/toast'
import { api } from '#/lib/api'
import { goalsNewlyHit } from '#/lib/goals'
import { goalsQuery, milestonesQuery } from '#/lib/queries'
import type { Milestone, NewMilestone } from '#/types/api'

type SavedMilestone = Omit<Milestone, 'exerciseName'>

function useInvalidateMilestones() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: milestonesQuery.queryKey })
}

function useOnMilestoneSaved(title: string) {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateMilestones()
  return (milestone: SavedMilestone) => {
    toast.add({ title, type: 'success' })
    const previous = queryClient.getQueryData(milestonesQuery.queryKey) ?? []
    queryClient
      .query({ ...goalsQuery, staleTime: 'static' })
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
  }
}

export function useCreateMilestone() {
  return useMutation({
    mutationFn: (milestone: NewMilestone) =>
      api<SavedMilestone>('/milestones', {
        method: 'POST',
        body: JSON.stringify(milestone),
      }),
    onSuccess: useOnMilestoneSaved('Milestone logged'),
  })
}

export function useUpdateMilestone(id: string) {
  const queryClient = useQueryClient()
  const onSaved = useOnMilestoneSaved('Milestone updated')
  return useMutation({
    mutationFn: (milestone: NewMilestone) =>
      api<SavedMilestone>(`/milestones/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(milestone),
      }),
    onSuccess: (milestone) =>
      Promise.all([
        onSaved(milestone),
        queryClient.invalidateQueries({ queryKey: goalsQuery.queryKey }),
      ]),
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
