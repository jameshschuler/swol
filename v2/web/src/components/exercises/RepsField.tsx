import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { maxReps } from '#/lib/lifts'

export function RepsField({
  id,
  value,
  onChange,
}: {
  id: string
  value: string
  onChange: (reps: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>Reps</Label>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min="1"
        max={maxReps}
        step="1"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-28"
      />
    </div>
  )
}
