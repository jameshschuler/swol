import { useQuery } from '@tanstack/react-query'
import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { exercisesQuery } from '#/lib/queries'
import { newExerciseId } from './exercise-constants'
import { NewExerciseForm } from './NewExerciseForm'

export function ExerciseField({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (exerciseId: string) => void
}) {
  const { data: exercises = [] } = useQuery(exercisesQuery)
  const labels: Record<string, string> = {
    ...Object.fromEntries(
      exercises.map((exercise) => [exercise.id, exercise.name]),
    ),
    [newExerciseId]: '+ New exercise',
  }

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Exercise</Label>
      <Select
        value={value || null}
        onValueChange={(next) => onChange(next ?? '')}
        items={labels}
      >
        <SelectTrigger
          id={id}
          className="bg-secondary-background text-foreground"
        >
          <SelectValue placeholder="Choose an exercise" />
        </SelectTrigger>
        <SelectContent>
          {exercises.map((exercise) => (
            <SelectItem key={exercise.id} value={exercise.id}>
              {exercise.name}
            </SelectItem>
          ))}
          <SelectItem value={newExerciseId}>+ New exercise</SelectItem>
        </SelectContent>
      </Select>
      {value === newExerciseId && <NewExerciseForm onCreated={onChange} />}
    </div>
  )
}
