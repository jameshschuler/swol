import type { CheckInDisplayItem } from '@/features/CheckIns/types/checkIns'
import { Button, Divider, Flex, Title } from '@mantine/core'
import { useState } from 'react'
import { useModal } from '@/hooks'
import { CheckInCard } from './CheckInCard'
import { DetailsDrawer } from './DetailsDrawer'

interface CheckInsListProps {
  checkIns: CheckInDisplayItem
  loadMore: () => void
  loading: boolean
  hasMore: boolean
}

export function CheckInsList({ checkIns, loadMore, loading, hasMore }: CheckInsListProps) {
  const [selectedCheckIns, setSelectedCheckIns] = useState<number[]>([])
  const detailsDrawer = useModal(false)

  return (
    <>
      <Flex direction="column">
        {[...checkIns].map(([year, months]) => (
          <Flex direction="column" gap={32} key={year}>
            <Title order={2}>{year}</Title>
            <Flex direction="column" gap={32}>
              {[...months].map(([month, data]) => (
                <Flex direction="column" gap={16} key={month}>
                  <Title size="md" order={3}>
                    {month}
                  </Title>
                  <Flex gap={16} wrap="wrap">
                    {/* TODO: issue with activity doubling after saving check in changes */}
                    {[...data].map(([checkInDate, details]) => (
                      <CheckInCard
                        key={checkInDate}
                        activityCount={details.length}
                        checkInDate={checkInDate}
                        onClick={() => {
                          setSelectedCheckIns(details.map(d => d.id))
                          detailsDrawer.open()
                        }}
                      />
                    ))}
                  </Flex>
                </Flex>
              ))}
            </Flex>
            <Divider mb={32} />
          </Flex>
        ))}
        <Button disabled={!hasMore} loading={loading} style={{ alignSelf: 'center' }} size="md" variant="outline" color="gray" onClick={loadMore}>Load more</Button>
      </Flex>
      {/* <ConfirmModal 
        opened={removeModal.opened} 
        close={removeModal.close} 
        onConfirm={handleRemoveProgram} 
        isPending={isPending} 
        entityName="check in"
      /> */}
      <DetailsDrawer opened={detailsDrawer.opened} close={detailsDrawer.close} checkInIds={selectedCheckIns} />
    </>
  )
}
