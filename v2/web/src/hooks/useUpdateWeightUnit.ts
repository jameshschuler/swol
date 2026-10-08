import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '#/lib/api'
import { meQuery } from '#/lib/queries'
import type { Me, WeightUnit } from '#/types/api'

export function useUpdateWeightUnit() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (weightUnit: WeightUnit) =>
      api<Me>('/me', { method: 'PATCH', body: JSON.stringify({ weightUnit }) }),
    onSuccess: (me) => queryClient.setQueryData(meQuery.queryKey, me),
  })
}
