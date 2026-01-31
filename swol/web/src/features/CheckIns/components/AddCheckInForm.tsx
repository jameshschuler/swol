import type { ComboboxItem, SelectProps } from '@mantine/core'
import { faCheck, faStar } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Divider, Flex, Group, Select, Text, Textarea } from '@mantine/core'
import { DatePicker } from '@mantine/dates'
import { useForm } from '@mantine/form'
import dayjs from 'dayjs'
import { useGetPrograms } from '@/features/Programs/hooks/useGetPrograms'
import { useIsMobile } from '@/hooks/useIsMobile'
import { activityTypeOptions } from '@/lib/constants'
import { SWOL_GREEN } from '@/theme'
import { useAddCheckIn } from '../hooks/useAddCheckIn'
import { useState } from 'react'

interface ExtendedComboboxItem extends ComboboxItem {
  isCurrent?: boolean
}

const renderSelectOption: SelectProps['renderOption'] = ({ option, checked = false }: { option: ExtendedComboboxItem, checked?: boolean }) => (
  <Group flex="1" gap="xs">
    {option.label}
    {option.isCurrent && <FontAwesomeIcon color="gold" icon={faStar} />}
    {checked && <FontAwesomeIcon style={{ marginInlineStart: 'auto' }} icon={faCheck} />}
  </Group>
)

interface AddCheckInFormProps {
  close: () => void
}

export function AddCheckInForm({ close }: AddCheckInFormProps) {
  const isMobile = useIsMobile()

  const { data: programsData, isLoading } = useGetPrograms()
  const { mutateAsync: addCheckIn, isPending } = useAddCheckIn()
  
  const [selectedDate, setSelectedDate] = useState<Date>(dayjs().toDate())

  const form = useForm({
    initialValues: {
      date: dayjs().toDate(),
      activityId: '1',
      notes: '',
      programId: localStorage.getItem('lastUsedProgramId') || '',
    },
    validate: {
      date: value => (!value ? 'Date is required' : null),
    },
  })

  const handleOnSubmit = async (values: { activityId: string, programId?: string, date: Date, notes: string }) => {
    await addCheckIn({
      checkinDate: dayjs(values.date).utc().format(),
      activityId: Number(values.activityId),
      notes: values.notes,
      programId: values.programId ? Number(values.programId) : undefined,
    })

    localStorage.setItem('lastUsedProgramId', values.programId || '')

    form.reset()
    close()
  }

  return (
    <form
      style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
      onSubmit={form.onSubmit(handleOnSubmit)}
    >
      <Flex justify="center">
        <DatePicker
          size="md"
          numberOfColumns={isMobile ? 1 : 2}
          value={selectedDate}
          onChange={(date) => {
            form.setFieldValue('date', date as unknown as Date)
            form.validateField('date')
            setSelectedDate(date as unknown as Date)
          }}
        />
      </Flex>
      {form.errors.date && (
        <Text c="red" size="xs">
          {form.errors.date}
        </Text>
      )}

      <Select
        size="md"
        required
        label="Activity Type"
        placeholder="Select activity type"
        data={activityTypeOptions}
        key={form.key('activityId')}
        {...form.getInputProps('activityId')}
      />

      <Select
        size="md"
        label="Program"
        placeholder="Select program"
        disabled={isLoading}
        data={[
          { label: 'No Program', value: '' },
          ...(programsData?.programs.map(program => ({
            label: program.name,
            value: program.id.toString(),
            isCurrent: programsData.currentPrograms?.[program.programType]?.id === program.id,
          })) || []),
        ]}
        renderOption={renderSelectOption}
        nothingFoundMessage="No programs created yet"
        key={form.key('programId')}
        {...form.getInputProps('programId')}
      />

      <Divider my="md" />

      <div>
        <Textarea
          label="Notes"
          placeholder="Enter some notes..."
          rows={5}
          maxLength={500}
          size="md"
          key={form.key('notes')}
          {...form.getInputProps('notes')}
        />
        <Text size="sm" c="dimmed" mt={4}>
          {form.values.notes.length}
          {' '}
          / 500
        </Text>
      </div>

      <Group justify="flex-end">
        <Button
          type="submit"
          color={SWOL_GREEN}
          radius="md"
          disabled={isPending}
          loading={isPending}
        >
          Add
        </Button>
      </Group>
    </form>
  )
}
