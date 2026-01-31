import { queryOptions, useQuery } from '@tanstack/react-query'
import { useAuth } from '@/hooks'
import { client } from '@/lib/honoClient'

export const CHECKINS_QUERY_KEY = 'check-ins'

export interface CheckInQueryParams {
  from?: string
  to?: string
}

export function getAllCheckInsQueryOptions(accessToken?: string, params?: CheckInQueryParams) {
  return queryOptions({
    queryKey: [CHECKINS_QUERY_KEY, params?.from, params?.to],
    queryFn: async () => {
      const res = await client['check-ins'].$get({
        query: {
          from: params?.from,
          to: params?.to,
        },
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      })
      const data = await res.json()

      return data
    },
  })
}

export function useGetAllCheckIns(params?: CheckInQueryParams) {
  const { session } = useAuth()
  const options = getAllCheckInsQueryOptions(session?.access_token, params)
  return useQuery(options)
}
