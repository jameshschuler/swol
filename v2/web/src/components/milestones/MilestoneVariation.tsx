import { ExerciseLink } from '#/components/exercises/ExerciseLink'
import { currentRecords, formatLift } from '#/lib/milestones'
import type { ExerciseMilestones } from '#/lib/milestones'
import type { WeightUnit } from '#/types/api'
import { MilestoneRowList } from './MilestoneRowList'

export function MilestoneVariation({
  variation,
  unit,
  showHeading,
}: {
  variation: ExerciseMilestones
  unit: WeightUnit
  showHeading: boolean
}) {
  const records = currentRecords(variation)
  const total = variation.milestones.length

  return (
    <section className="flex flex-col gap-2">
      {showHeading && (
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 truncate font-heading text-sm">
            <ExerciseLink exerciseId={variation.exerciseId}>
              {variation.exerciseName}
            </ExerciseLink>
          </h3>
          <p className="font-heading text-sm whitespace-nowrap tabular-nums">
            {formatLift(variation.best, unit)}
          </p>
        </div>
      )}
      <MilestoneRowList
        milestones={records}
        records={variation.records}
        unit={unit}
      />
      {records.length < total && (
        <ExerciseLink
          exerciseId={variation.exerciseId}
          className="self-start text-sm"
        >
          See all {total} milestones
        </ExerciseLink>
      )}
    </section>
  )
}
