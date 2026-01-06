import type { EditCheckInRequest } from '../hooks/useEditCheckIn'
import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Box, Button, Divider, Drawer, Flex, Group, Input, Select, Text, Textarea } from '@mantine/core'
import { DatePickerInput } from '@mantine/dates'
import { useForm } from '@mantine/form'
import dayjs from 'dayjs'
import { useEffect } from 'react'
import { useIsPhablet, useNotifications } from '@/hooks'
import { activityTypeOptions } from '@/lib/constants'
import { SWOL_GREEN } from '@/theme'
import { useEditCheckIn } from '../hooks/useEditCheckIn'
import { useGetAllCheckInsByIds } from '../hooks/useGetCheckInsByIds'
import { CheckInSkeleton } from './CheckInSkeleton'
import { ProgramsSelect } from './ProgramsSelect'

interface FormValues {
  id: number
  activityId?: string
  programId?: string
  notes: string
  checkinDate: string
}

interface DetailsDrawerProps {
  opened: boolean
  close: () => void
  checkInIds: number[]
}

// TODO: not displaying recently created check in details
export function DetailsDrawer({ opened, close, checkInIds }: DetailsDrawerProps) {
  const isPhablet = useIsPhablet()
  const { success } = useNotifications()

  const { mutate: editCheckIn, isPending } = useEditCheckIn()
  const { data, isLoading } = useGetAllCheckInsByIds({
    ids: checkInIds,
  })
  const checkIns = data?.checkIns ?? []

  const form = useForm({
    initialValues: {
      checkIns: new Array<FormValues>(),
    },
  })

  useEffect(() => {
    if (!isLoading && data?.checkIns?.length !== 0) {
      form.setValues({
        checkIns: data?.checkIns.map(checkIn => ({
          id: checkIn.id,
          activityId: checkIn.activity?.id.toString(),
          checkinDate: checkIn.checkinDate,
          notes: checkIn.notes ?? '',
          programId: checkIn.program?.id.toString(),
        })) ?? [],
      })
    }
  }, [data?.checkIns, isLoading])

  const handleOnSubmit = async (values: { checkIns: FormValues[] }) => {
    const editCheckInRequests = values.checkIns.reduce((requests, checkIn) => {
      const originalCheckIn = checkIns.find(c => c.id === checkIn.id)
      if (originalCheckIn) {
        const hasChanges
          = checkIn.checkinDate !== originalCheckIn.checkinDate
          || (checkIn.activityId && Number(checkIn.activityId) !== originalCheckIn.activity?.id)
          || (checkIn.programId && Number(checkIn.programId) !== originalCheckIn.program?.id)
          || checkIn.notes !== originalCheckIn.notes

        if (hasChanges) {
          requests.push({
            id: checkIn.id,
            activityId: Number(checkIn.activityId),
            checkinDate: dayjs(checkIn.checkinDate).utc().format(),
            notes: checkIn.notes,
            programId: Number(checkIn.programId),
          })
        }
      }
      return requests
    }, new Array<EditCheckInRequest>())

    if (editCheckInRequests.length !== 0) {
      await Promise.all(editCheckInRequests.map(request => editCheckIn(request)))

      success({
        message: `Updated check in${editCheckInRequests.length > 1 ? 's' : ''} successfully.`,
      })
    }

    form.reset()
    close()
  }

  return (
    <Drawer.Root
      opened={opened}
      onClose={close}
      position={isPhablet ? 'bottom' : 'right'}
      top={isPhablet ? 25 : 0}
      size={isPhablet ? '95%' : 'lg'}
    >
      <Drawer.Overlay />
      <Drawer.Content style={isPhablet
        ? {
          borderTopRightRadius: '16px',
          borderTopLeftRadius: '16px',
        }
        : {}}
      >
        <Drawer.Header p={24}>
          <Drawer.Title>
            <Text size="xl" fw={600}>
              Check In Details
            </Text>
          </Drawer.Title>
          <Drawer.CloseButton icon={<FontAwesomeIcon icon={faCircleXmark} size="xl" />} />
        </Drawer.Header>
        <Divider mb="md" mx="md" />
        <Drawer.Body px={24} pb={16}>
          {isLoading && (
            <CheckInSkeleton />
          )}
          {/* TODO: should create a Form component or move styles to a nested Flex component */}
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: 24, margin: '24px 0' }}
            onSubmit={form.onSubmit(handleOnSubmit)}
          >
            <Group justify="flex-end">
              <Button
                type="submit"
                color={SWOL_GREEN}
                radius="md"
                disabled={!form.isTouched() || isPending}
                loading={isPending}
              >
                Save
              </Button>
            </Group>
            {checkIns.length !== 0 && checkIns.map((checkIn, index) => {
              return (
                <Box key={checkIn.id}>
                  {index !== 0 && <Divider mb="lg" />}
                  <Input
                    style={{ display: 'none' }}
                    key={form.key(`checkIns.${index}.id`)}
                    {...form.getInputProps(`checkIns.${index}.id`)}
                  />
                  <Flex direction="column" gap={24}>
                    <DatePickerInput
                      label="Check In Date"
                      placeholder="Check In Date"
                      size="md"
                      key={form.key(`checkIns.${index}.checkinDate`)}
                      {...form.getInputProps(`checkIns.${index}.checkinDate`)}
                    />
                    <Select
                      size="md"
                      required
                      label="Activity Type"
                      placeholder="Select activity type"
                      data={activityTypeOptions}
                      key={form.key(`checkIns.${index}.activityId`)}
                      {...form.getInputProps(`checkIns.${index}.activityId`)}
                    />

                    <ProgramsSelect
                      formKey={form.key(`checkIns.${index}.programId`)}
                      inputProps={form.getInputProps(`checkIns.${index}.programId`)}
                    />

                    <div>
                      <Textarea
                        label="Notes"
                        placeholder="Enter some notes..."
                        rows={5}
                        maxLength={500}
                        size="md"
                        key={form.key(`checkIns.${index}.notes`)}
                        {...form.getInputProps(`checkIns.${index}.notes`)}
                      />
                      <Text size="sm" c="dimmed" mt={4}>
                        {form.values.checkIns[index]?.notes?.length}
                        {' '}
                        / 500
                      </Text>
                    </div>
                  </Flex>
                </Box>
              )
            })}
          </form>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  )
}
