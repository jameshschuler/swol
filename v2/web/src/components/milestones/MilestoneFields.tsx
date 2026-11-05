import { ExerciseField } from '#/components/exercises/ExerciseField'
import { RepsField } from '#/components/exercises/RepsField'
import { WeightField } from '#/components/exercises/WeightField'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { localDateKey } from '#/lib/dates'
import type { MilestoneDraft } from '#/lib/milestones'
import { RpeField } from './RpeField'

export function MilestoneFields({
  idPrefix,
  draft,
  onChange,
}: {
  idPrefix: string
  draft: MilestoneDraft
  onChange: (changes: Partial<MilestoneDraft>) => void
}) {
  return (
    <>
      <ExerciseField
        id={`${idPrefix}-exercise`}
        value={draft.exerciseId}
        onChange={(exerciseId) => onChange({ exerciseId })}
      />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <WeightField
          id={`${idPrefix}-weight`}
          label="Weight"
          weight={draft.weight}
          onWeightChange={(weight) => onChange({ weight })}
          unit={draft.unit}
          onUnitChange={(unit) => onChange({ unit })}
        />
        <RepsField
          id={`${idPrefix}-reps`}
          value={draft.reps}
          onChange={(reps) => onChange({ reps })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex min-w-0 flex-col gap-2">
          <Label htmlFor={`${idPrefix}-date`}>Date</Label>
          <Input
            id={`${idPrefix}-date`}
            type="date"
            max={localDateKey(new Date())}
            value={draft.date}
            onChange={(event) => onChange({ date: event.target.value })}
          />
        </div>
        <RpeField
          id={`${idPrefix}-rpe`}
          value={draft.rpe}
          onChange={(rpe) => onChange({ rpe })}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor={`${idPrefix}-note`}>Note</Label>
        <Input
          id={`${idPrefix}-note`}
          value={draft.note}
          onChange={(event) => onChange({ note: event.target.value })}
          placeholder="Belt, straps, felt fast…"
          maxLength={500}
        />
      </div>
    </>
  )
}
