import { Label } from '#/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { rpeValues } from '#/lib/lifts'

const items = [
  { value: null, label: 'None' },
  ...rpeValues.map((rpe) => ({ value: rpe, label: String(rpe) })),
]

export function RpeField({
  id,
  value,
  onChange,
}: {
  id: string
  value: number | null
  onChange: (rpe: number | null) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>RPE</Label>
      <Select value={value} onValueChange={onChange} items={items}>
        <SelectTrigger
          id={id}
          className="bg-secondary-background text-foreground"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.label} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
