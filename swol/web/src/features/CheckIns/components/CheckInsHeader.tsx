import { faPlus } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Flex, Select, Title } from '@mantine/core'
import { SWOL_GREEN } from '@/theme'
import { ResponsiveButton } from '../../../components/ui/ResponsiveButton'
import { useState } from 'react'

interface CheckInsHeaderProps {
  hasCheckIns: boolean
  onAddCheckIn: () => void
  onFilterChange: (value: string | null) => void
}

export function CheckInsHeader({ onAddCheckIn, hasCheckIns, onFilterChange }: CheckInsHeaderProps) {
  const [selectedFilter, setSelectedFilter] = useState<string>('30');

  return (
    <Flex justify="space-between" align="center" direction={{ base: 'column', sm: 'row' }} gap={{ base: 16, sm: 0 }}>
      <Title>My Check Ins</Title>
      <Flex gap={8} align="center">
        {hasCheckIns && (
          <Flex gap={8} align="center">
            <Select
              value={selectedFilter}
              data={[
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 3 months' },
                { value: '180', label: 'Last 6 months' },
                { value: '365', label: 'Last year' },
                { value: 'all', label: 'All time' },
              ]}
              placeholder="Select date range"
              size="md"
              radius="md"
              onChange={(value) => {
                setSelectedFilter(value ?? '30');
                onFilterChange(value);
              }}
            />


            <ResponsiveButton
              icon={<FontAwesomeIcon icon={faPlus} size="lg" />}
              onClick={onAddCheckIn}
              label="New Check In"
              color={SWOL_GREEN}
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}
