import { useQuery } from '@tanstack/react-query'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { baseExercises } from '#/lib/exercises'
import { exercisesQuery } from '#/lib/queries'

export function BaseExerciseField({
  id,
  exerciseId,
  value,
  onChange,
}: {
  id: string
  exerciseId?: string
  value: string | null
  onChange: (baseExerciseId: string | null) => void
}) {
  const { data: exercises = [] } = useQuery(exercisesQuery)
  const items = [
    { value: null, label: 'None' },
    ...baseExercises(exercises)
      .filter((exercise) => exercise.id !== exerciseId)
      .map((exercise) => ({ value: exercise.id, label: exercise.name })),
  ]

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Label htmlFor={id}>Variation of</Label>
      <Select value={value} onValueChange={onChange} items={items}>
        <SelectTrigger
          id={id}
          className="bg-secondary-background text-foreground"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value ?? 'none'} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
