import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth, useNotifications } from '@/hooks'
import { client } from '@/lib/honoClient'
import { CHECKINS_QUERY_KEY } from './useGetCheckIns'
import { CHECKINS_BY_IDS_QUERY_KEY } from './useGetCheckInsByIds'

export interface EditCheckInRequest {
  id: number
  checkinDate?: string
  activityId?: number
  notes?: string | null
  programId?: number | null
}

export async function editCheckIn(payload: EditCheckInRequest, accessToken?: string) {
  const { id, ...rest } = payload
  const response = await client['check-ins'][':id'].$patch({
    param: { id },
    json: rest,
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Unable to update check in. Please try again in a moment.')
  }

  return response.json()
}

export function useEditCheckIn() {
  const { session } = useAuth()
  const queryClient = useQueryClient()
  
  return useMutation({
    onSuccess: ({ id }) => {
      queryClient.invalidateQueries({
        queryKey: [CHECKINS_QUERY_KEY],
      })
      queryClient.invalidateQueries({
        queryKey: [CHECKINS_BY_IDS_QUERY_KEY],
      })
    },
    onError: (_err) => {
      error({
        message: 'Unable to update check in. Please try again in a moment.',
      })
    },
    mutationFn: (payload: EditCheckInRequest) => editCheckIn(payload, session?.access_token),
  })
}
