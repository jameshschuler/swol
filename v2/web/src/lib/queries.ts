import {
  queryOptions,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'
import { api } from './api'
import type { Me, WeightUnit } from './api'

export const meQuery = queryOptions({
  queryKey: ['me'],
  queryFn: () => api<Me>('/me'),
})

export function useUpdateWeightUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (weightUnit: WeightUnit) =>
      api<Me>('/me', { method: 'PATCH', body: JSON.stringify({ weightUnit }) }),
    onSuccess: (me) => queryClient.setQueryData(meQuery.queryKey, me),
  })
}
