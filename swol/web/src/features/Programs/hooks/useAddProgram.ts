import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth, useNotifications } from '@/hooks'
import { client } from '@/lib/honoClient'
import { PROGRAMS_QUERY_KEY } from './useGetPrograms'

export interface AddProgramRequest {
  name: string
  programType: string
  active: boolean
  author: string
  description?: string
  weeks?: number
  daysPerWeek?: number
}

export async function addProgram(payload: AddProgramRequest, accessToken?: string) {
  const response = await client.programs.$post({
    json: payload,
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Unable to add program. Please try again in a moment.')
  }

  return response.json()
}

export function useAddProgram() {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  const { success, error } = useNotifications()

  return useMutation({
    onSuccess: () => {
      success({
        message: `Added program successfully.`,
      })

      queryClient.invalidateQueries({
        queryKey: [PROGRAMS_QUERY_KEY],
      })
    },
    onError: (_err) => {
      error({
        message: 'Unable to add program. Please try again in a moment.',
      })
    },
    mutationFn: (payload: AddProgramRequest) => addProgram(payload, session?.access_token),
  })
}
