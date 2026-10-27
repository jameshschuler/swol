import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { toast } from '#/components/ui/toast'
import { api } from '#/lib/api'
import { formatDate } from '#/lib/format'
import { sessionQuery, sessionsQuery } from '#/lib/queries'
import type { WorkoutSession } from '#/types/api'

export type SessionAction = 'pause' | 'resume' | 'end'

function useInvalidateSessions() {
  const queryClient = useQueryClient()
  return () =>
    queryClient.invalidateQueries({ queryKey: sessionsQuery.queryKey })
}

export function useStartSession() {
  const onSuccess = useInvalidateSessions()
  return useMutation({
    mutationFn: () => api<WorkoutSession>('/sessions', { method: 'POST' }),
    onSuccess,
  })
}

export function useCheckIn() {
  const invalidate = useInvalidateSessions()
  return useMutation({
    mutationFn: (checkedInAt: string) =>
      api<WorkoutSession>('/sessions/check-in', {
        method: 'POST',
        body: JSON.stringify({ checkedInAt }),
      }),
    onSuccess: (session) => {
      toast.add({
        title: 'Checked in',
        description: formatDate(session.startedAt),
        type: 'success',
      })
      return invalidate()
    },
  })
}

export function useSessionAction(sessionId: string) {
  const onSuccess = useInvalidateSessions()
  return useMutation({
    mutationFn: (action: SessionAction) =>
      api<WorkoutSession>(`/sessions/${sessionId}/${action}`, {
        method: 'POST',
      }),
    onSuccess,
  })
}

export function useDeleteSession(sessionId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const invalidate = useInvalidateSessions()
  return useMutation({
    mutationFn: () => api<void>(`/sessions/${sessionId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await navigate({ to: '/sessions' })
      queryClient.removeQueries({ queryKey: sessionQuery(sessionId).queryKey })
      await invalidate()
    },
  })
}

export function useUpdateSessionNotes(sessionId: string) {
  const invalidate = useInvalidateSessions()
  return useMutation({
    mutationFn: (notes: string) =>
      api<WorkoutSession>(`/sessions/${sessionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ notes }),
      }),
    onSuccess: () => {
      toast.add({ title: 'Notes saved', type: 'success' })
      return invalidate()
    },
  })
}
