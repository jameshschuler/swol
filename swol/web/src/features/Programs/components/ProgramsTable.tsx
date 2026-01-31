import { faPencil, faPlus, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Checkbox, Divider, Flex, Input, Table, TableScrollContainer, Text, Title, Tooltip } from '@mantine/core'
import { useDebouncedValue } from '@mantine/hooks'
import dayjs from 'dayjs'
import { useState } from 'react'
import { ConfirmModal } from '@/components/ConfirmModal'
import { ResponsiveButton } from '@/components/ui/ResponsiveButton'
import { useModal } from '@/hooks'
import { SWOL_GREEN } from '@/theme'
import { useGetPrograms } from '../hooks/useGetPrograms'
import { useRemoveProgram } from '../hooks/useRemoveProgram'
import { CreateEditProgramsDrawer } from './CreateEditProgramDrawer'
import { NoData } from './NoData'
import { TableLoader } from './TableLoader'

interface Program {
  id: number
  description: string | null
  name: string
  createdAt: string
  programType: string
  active: boolean
  author: string
  weeks?: number | null
  daysPerWeek?: number | null
}

function renderTableRows(isLoading: boolean, programs: Program[], setSelectedRow: React.Dispatch<React.SetStateAction<number | undefined>>, searchQuery?: string, selectedRow?: number) {
  if (isLoading) {
    return (
      <TableLoader rowCount={5} colCount={7} />
    ) 
  }

  if (programs.length === 0) {
    return (
      <Table.Tr>
        <Table.Td colSpan={7}>
          <NoData searchQuery={searchQuery} />
        </Table.Td>
      </Table.Tr>
    )
  }

  return (
    <>
      {(programs.map(program => (
        <Table.Tr key={program.id} bg={selectedRow === program.id ? 'var(--mantine-color-blue-light)' : undefined}>
          <Table.Td>
            <Checkbox
              aria-label="Select row"
              checked={selectedRow === program.id}
              disabled={selectedRow !== undefined && selectedRow !== program.id}
              onChange={(event) => {
                setSelectedRow(event.currentTarget.checked ? program.id : undefined)
              }}
            />
          </Table.Td>
          <Table.Td>{program.name}</Table.Td>
          <Table.Td>{program.programType}</Table.Td>
          <Table.Td>{program.weeks}</Table.Td>
          <Table.Td>{program.daysPerWeek}</Table.Td>
          <Table.Td>{program.author}</Table.Td>
          <Table.Td maw={200}>
            <Tooltip multiline w={200} label={program.description} withArrow>
              <Text truncate="end" size="sm">{program.description?.substring(0, 50)}</Text>
            </Tooltip>
          </Table.Td>
          <Table.Td>{program.active ? 'Yes' : 'No'}</Table.Td>
          <Table.Td>{dayjs(program.createdAt).format('MM/DD/YYYY')}</Table.Td>
        </Table.Tr>
      ))
      )}
    </>
  )
}

export function ProgramsTable() {
  const [selectedRow, setSelectedRow] = useState<number>()
  const [searchQuery, setSearchQuery] = useState('')
  const [debounced] = useDebouncedValue(searchQuery, 300)
  const { data, isLoading } = useGetPrograms(debounced)
  const addEditModal = useModal(false)
  const removeModal = useModal(false)
  
  const { mutateAsync: removeProgram, isPending } = useRemoveProgram()

  async function handleRemoveProgram() {
    await removeProgram({
      id: selectedRow!,
    })

    setSelectedRow(undefined)
    removeModal.close()
  }
  
  return (
    <Flex direction="column">
      <Flex justify="space-between">
        <Input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} variant="unstyled" size="md" w="50%" placeholder="Search by name, author, or program type..." />
        <Flex gap={8}>
          {selectedRow
            ? (
                <>
                  <ResponsiveButton
                    icon={<FontAwesomeIcon icon={faTrashAlt} size="lg" />}
                    onClick={removeModal.open}
                    label="Delete Program"
                    color="red"
                  />
                  <ResponsiveButton
                    icon={<FontAwesomeIcon icon={faPencil} size="lg" />}
                    onClick={addEditModal.open}
                    label="Edit Program"
                    color="blue"
                  />
                </>
              )
            : (
                <ResponsiveButton
                  icon={<FontAwesomeIcon icon={faPlus} size="lg" />}
                  onClick={addEditModal.open}
                  label="Add Program"
                  color={SWOL_GREEN}
                />
              )}
        </Flex>
      </Flex>
      <Divider my={24} />
      <Title size={24}>Programs</Title>
      <TableScrollContainer minWidth={768}>
        <Table mt={24} verticalSpacing="sm">
          <Table.Thead>
            <Table.Tr>
              <Table.Th />
              <Table.Th>Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Weeks</Table.Th>
              <Table.Th>Days/Week</Table.Th>
              <Table.Th>Author</Table.Th>
              <Table.Th>Description</Table.Th>
              <Table.Th>Current</Table.Th>
              <Table.Th>Created</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{renderTableRows(isLoading, data?.programs ?? [], setSelectedRow, debounced, selectedRow)}</Table.Tbody>
        </Table>
      </TableScrollContainer>
      <CreateEditProgramsDrawer 
        opened={addEditModal.opened} 
        close={addEditModal.close} 
        selectedProgramId={selectedRow}
        onSave={() => setSelectedRow(undefined)}
      />
      <ConfirmModal 
        opened={removeModal.opened} 
        close={removeModal.close} 
        onConfirm={handleRemoveProgram} 
        isPending={isPending} 
        entityName="program"
      />
    </Flex>
  )
}
