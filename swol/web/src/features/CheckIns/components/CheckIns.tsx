import type { CheckIn } from '../types/checkIns'
import { Box, Flex } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useEffect, useState } from 'react'
import { useGetAllCheckIns } from '@/features/CheckIns/hooks/useGetCheckIns'
import { useTransformCheckIns } from '../hooks/useTransformCheckIns'
import { AddCheckInDrawer } from './AddCheckInDrawer'
import { CheckInsHeader } from './CheckInsHeader'
import { CheckInsList } from './CheckInsList'
import { Error } from './Error'
import { ListSkeleton } from './ListSkeleton'
import { NoData } from './NoData'

export function CheckIns() {
  const currentYear = new Date().getFullYear().toString()
  const [year, setYear] = useState<string>(currentYear)
  const [month, setMonth] = useState<string>('1-6')

  const [allCheckIns, setAllCheckIns] = useState<CheckIn[]>([])

  const { isLoading, data, error, refetch } = useGetAllCheckIns({
    year,
    month,
  })
  const { checkIns } = useTransformCheckIns(allCheckIns)
  const [opened, { open, close }] = useDisclosure(false)

  useEffect(() => {
    if (data) {
      // TODO: fix (naughty)
      setAllCheckIns((prevCheckIns) => {
        return [...prevCheckIns, ...data.checkIns]
      })
    }
  }, [data])

  const handleLoadMore = () => {
    if (month === '7-12') {
      setMonth('1-6')
    } else {
      const nextYear = (Number.parseInt(year) - 1).toString()
      setYear(nextYear)
      setMonth('7-12')
    }
  }

  return (
    <Flex direction="column" gap={24}>
      <CheckInsHeader hasCheckIns={checkIns.size > 0} onAddCheckIn={open} />
      <Box>
        {isLoading && <ListSkeleton />}
        {error && (
          <Error
            message={error.message}
            onRetry={async () => {
              await refetch()
            }}
          />
        )}
        {!isLoading && allCheckIns?.length === 0 && !error && <NoData onAction={open} />}
        {!error && !isLoading && allCheckIns.length > 0 && (
          <CheckInsList hasMore={data?.hasMore ?? false} checkIns={checkIns} loadMore={handleLoadMore} loading={isLoading} />
        )}
      </Box>

      <AddCheckInDrawer opened={opened} close={close} />
    </Flex>
  )
}
