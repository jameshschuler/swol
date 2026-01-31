import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth, useNotifications } from '@/hooks'
import { client } from '@/lib/honoClient'
import { PROGRAM_QUERY_KEY } from './useGetProgram'
import { PROGRAMS_QUERY_KEY } from './useGetPrograms'

export interface EditProgramRequest {
  id: number
  name?: string
  programType?: string
  active?: boolean
  author?: string
  description?: string
  weeks?: number
  daysPerWeek?: number
}

export async function editProgram(payload: EditProgramRequest, accessToken?: string) {
  const { id, ...rest } = payload
  const response = await client.programs[':id'].$patch({
    param: { id },
    json: rest,
  }, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error('Unable to update program. Please try again in a moment.')
  }

  return response.json()
}

export function useEditProgram() {
  const { session } = useAuth()
  const queryClient = useQueryClient()

  const { success, error } = useNotifications()

  return useMutation({
    onSuccess: ({ id }) => {
      success({
        message: `Updated program successfully.`,
      })

      queryClient.invalidateQueries({
        queryKey: [PROGRAM_QUERY_KEY, id],
      })
      queryClient.invalidateQueries({
        queryKey: [PROGRAMS_QUERY_KEY],
      })
    },
    onError: (_err) => {
      error({
        message: 'Unable to update program. Please try again in a moment.',
      })
    },
    mutationFn: (payload: EditProgramRequest) => editProgram(payload, session?.access_token),
  })
}
