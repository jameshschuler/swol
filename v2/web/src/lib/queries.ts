import { queryOptions } from '@tanstack/react-query'
import { api } from './api'
import type { Me } from '#/types/api'

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: () => api<Me>('/me'),
})
