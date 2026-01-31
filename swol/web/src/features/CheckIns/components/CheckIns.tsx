import type { CheckIn } from '../types/checkIns'
import { Box, Flex } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useGetAllCheckIns } from '@/features/CheckIns/hooks/useGetCheckIns'
import { useTransformCheckIns } from '../hooks/useTransformCheckIns'
import { AddCheckInDrawer } from './AddCheckInDrawer'
import { CheckInsHeader } from './CheckInsHeader'
import { CheckInsList } from './CheckInsList'
import { Error } from './Error'
import { ListSkeleton } from './ListSkeleton'
import { NoData } from './NoData'
import { useState } from 'react'
import dayjs from 'dayjs'

export function CheckIns() {
  const [from, setFrom] = useState<string>(dayjs.utc().subtract(30, 'day').toISOString())
  const [to, setTo] = useState<string>(dayjs.utc().toISOString())
  const { isLoading, data, error, refetch } = useGetAllCheckIns({
    from,
    to,
  })
  const { checkIns } = useTransformCheckIns(data?.checkIns ?? [])
  const [opened, { open, close }] = useDisclosure(false)

  function handleFilterChange(value: string | null = '30') {
    const now = dayjs.utc();
    switch (value) {
      case '30':
        setFrom(now.subtract(30, 'day').toISOString())
        setTo(now.endOf('day').toISOString());
        break
      case '90':
        setFrom(now.subtract(90, 'day').toISOString())
        setTo(now.endOf('day').toISOString());
        break
      case '180':
        setFrom(now.subtract(180, 'day').toISOString())
        setTo(now.endOf('day').toISOString());
        break
      case '365':
        setFrom(now.subtract(365, 'day').toISOString())
        setTo(now.endOf('day').toISOString());
        break
      case 'all':
        setFrom('1970-01-01T00:00:00.000Z')
        setTo(now.endOf('day').toISOString());
        break
      default:
        setFrom(now.subtract(30, 'day').toISOString())
        setTo(now.endOf('day').toISOString());
        break
    }
  }

  return (
    <Flex direction="column" gap={24}>
      <CheckInsHeader hasCheckIns={checkIns.size > 0} onAddCheckIn={open} onFilterChange={handleFilterChange} />
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
        {!isLoading && checkIns.size === 0 && !error && <NoData onAction={open} />}
        {!error && !isLoading && checkIns.size > 0 && (
          <CheckInsList checkIns={checkIns} />
        )}
      </Box>

      <AddCheckInDrawer opened={opened} close={close} />
    </Flex>
  )
}
