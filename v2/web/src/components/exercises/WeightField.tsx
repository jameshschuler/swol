import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import type { WeightUnit } from '#/types/api'

export function WeightField({
  id,
  label,
  weight,
  onWeightChange,
  unit,
  onUnitChange,
}: {
  id: string
  label: string
  weight: string
  onWeightChange: (weight: string) => void
  unit: WeightUnit
  onUnitChange: (unit: WeightUnit) => void
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] gap-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          value={weight}
          onChange={(event) => onWeightChange(event.target.value)}
        />
      </div>
      <div className="flex items-end gap-2">
        {(['lb', 'kg'] as const).map((value) => (
          <Button
            key={value}
            type="button"
            variant={unit === value ? 'default' : 'neutral'}
            aria-pressed={unit === value}
            onClick={() => onUnitChange(value)}
          >
            {value}
          </Button>
        ))}
      </div>
    </div>
  )
}
