import { faCircleXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Button, Divider, Drawer, Group, Input, Select, Text, Textarea } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useEffect } from 'react'
import { useIsPhablet } from '@/hooks'
import { SWOL_GREEN } from '@/theme'
import { useAddProgram } from '../hooks/useAddProgram'
import { useEditProgram } from '../hooks/useEditProgram'
import { useGetProgram } from '../hooks/useGetProgram'

interface FormValues {
  name: string
  programType: string
  setAsCurrent: string
  author?: string
  description?: string
  weeks?: number
  daysPerWeek?: number
}

interface CreateEditProgramDrawerProps {
  opened: boolean
  close: () => void
  selectedProgramId?: number
  onSave: () => void
}

export function CreateEditProgramsDrawer({ opened, close, selectedProgramId, onSave }: CreateEditProgramDrawerProps) {
  const isPhablet = useIsPhablet()
  const { mutateAsync: addProgram, isPending: adding } = useAddProgram()
  const { mutateAsync: editProgram, isPending: updating } = useEditProgram()

  // TODO: should this run before the drawer opens?
  const { data: program } = useGetProgram(selectedProgramId)

  const isEditMode = selectedProgramId !== undefined

  const form = useForm<FormValues>({
    initialValues: {
      name: '',
      author: '',
      description: '',
      programType: '',
      setAsCurrent: 'No',
      weeks: undefined,
      daysPerWeek: undefined,
    },
    validate: {
      name: value => (!value ? 'Name is required' : null),
      programType: value => (!value ? 'Program type is required' : null),
      setAsCurrent: value => (value === '' ? 'Set as current program is required' : null),
    },
  })

  const handleOnSubmit = async (values: FormValues) => {
    if (isEditMode) {
      await editProgram({
        id: selectedProgramId!,
        name: values.name,
        programType: values.programType,
        active: values.setAsCurrent === 'Yes',
        author: values.author || '',
        description: values.description || '',
        weeks: values.weeks ? Number(values.weeks) : undefined,
        daysPerWeek: values.daysPerWeek ? Number(values.daysPerWeek) : undefined,
      })
    } else {
      await addProgram({
        name: values.name,
        programType: values.programType,
        active: values.setAsCurrent === 'Yes',
        author: values.author || '',
        description: values.description || '',
        weeks: values.weeks ? Number(values.weeks) : undefined,
        daysPerWeek: values.daysPerWeek ? Number(values.daysPerWeek) : undefined,
      })
    }

    form.reset()
    close()
    onSave()
  }

  useEffect(() => {
    if (program && opened) {
      form.setValues({
        name: program.name,
        author: program.author || '',
        description: program.description || '',
        programType: program.programType,
        setAsCurrent: program.active ? 'Yes' : 'No',
        weeks: program.weeks,
        daysPerWeek: program.daysPerWeek,
      })
    }
  }, [program, opened])

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
              {isEditMode ? 'Edit Program' : 'New Program'}
            </Text>
          </Drawer.Title>
          <Drawer.CloseButton icon={<FontAwesomeIcon icon={faCircleXmark} size="xl" />} />
        </Drawer.Header>
        <Divider mb="md" mx="md" />
        <Drawer.Body px={24} pb={16}>
          <form
            style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            onSubmit={form.onSubmit(handleOnSubmit)}
          >
            <Group justify="flex-end">
              <Button
                type="submit"
                color={SWOL_GREEN}
                radius="md"
                disabled={adding || updating}
                loading={adding || updating}
              >
                {isEditMode ? 'Save' : 'Add'}
              </Button>
            </Group>
            <Input.Wrapper label="Name" size="md" required>
              <Input
                size="md"
                key={form.key('name')}
                {...form.getInputProps('name')}
                placeholder="Enter a name..."
                maxLength={100}
              />
            </Input.Wrapper>
            <Select
              size="md"
              required
              label="Program Type"
              placeholder="Select program type"
              data={['Strength Training', 'Running']}
              key={form.key('programType')}
              {...form.getInputProps('programType')}
            />
            <Input.Wrapper label="Weeks" size="md">
              <Input 
                size="md"
                placeholder="Enter number of weeks..." 
                type='number'
                key={form.key('weeks')}
                {...form.getInputProps('weeks')}
              />
            </Input.Wrapper>
            <Input.Wrapper label="Days Per Week" size="md">
              <Input 
                size="md"
                placeholder="Enter number of days per week..." 
                type='number'
                key={form.key('daysPerWeek')}
                {...form.getInputProps('daysPerWeek')}
              />
            </Input.Wrapper>
            <Select
              size="md"
              defaultValue="No"
              description="Only one current program per type is allowed."
              label="Set as Current Program"
              data={['Yes', 'No']}
              key={form.key('setAsCurrent')}
              {...form.getInputProps('setAsCurrent')}
            />
            <Input.Wrapper label="Author" size="md">
              <Input 
                size="md"
                placeholder="Enter an author..." 
                maxLength={100}
                key={form.key('author')}
                {...form.getInputProps('author')}
              />
            </Input.Wrapper>
            <Textarea
              label="Description"
              placeholder="Enter a description..."
              rows={5}
              maxLength={500}
              size="md"
              key={form.key('description')}
              {...form.getInputProps('description')}
            />
          </form>
        </Drawer.Body>
      </Drawer.Content>
    </Drawer.Root>
  )
}
