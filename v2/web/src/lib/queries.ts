import { queryOptions } from '@tanstack/react-query'
import { api } from './api'
import type {
  Exercise,
  LegacyCheckIn,
  Me,
  Milestone,
  WorkoutSession,
} from '#/types/api'

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: () => api<Me>('/me'),
})

export const sessionsQuery = queryOptions({
  queryKey: ['sessions'],
  queryFn: () => api<WorkoutSession[]>('/sessions'),
})

export const currentSessionQuery = queryOptions({
  queryKey: ['sessions', 'current'],
  queryFn: () => api<WorkoutSession | null>('/sessions/current'),
})

export const sessionQuery = (id: string) =>
  queryOptions({
    queryKey: ['sessions', id],
    queryFn: () => api<WorkoutSession>(`/sessions/${id}`),
  })

export const legacyCheckInsQuery = queryOptions({
  queryKey: ['legacy-check-ins'],
  queryFn: () => api<LegacyCheckIn[]>('/legacy-check-ins'),
  staleTime: Infinity,
})

export const exercisesQuery = queryOptions({
  queryKey: ['exercises'],
  queryFn: () => api<Exercise[]>('/exercises'),
})

export const milestonesQuery = queryOptions({
  queryKey: ['milestones'],
  queryFn: () => api<Milestone[]>('/milestones'),
})
