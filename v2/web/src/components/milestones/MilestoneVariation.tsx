import { formatLift } from '#/lib/milestones'
import type { ExerciseMilestones } from '#/lib/milestones'
import type { WeightUnit } from '#/types/api'
import { MilestoneRow } from './MilestoneRow'

export function MilestoneVariation({
  variation,
  unit,
  showHeading,
}: {
  variation: ExerciseMilestones
  unit: WeightUnit
  showHeading: boolean
}) {
  return (
    <section className="flex flex-col gap-2">
      {showHeading && (
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="min-w-0 truncate font-heading text-sm">
            {variation.exerciseName}
          </h3>
          <p className="font-heading text-sm whitespace-nowrap tabular-nums">
            {formatLift(variation.best, unit)}
          </p>
        </div>
      )}
      <ul className="flex flex-col gap-2">
        {variation.milestones.map((milestone) => (
          <MilestoneRow
            key={milestone.id}
            milestone={milestone}
            unit={unit}
            record={variation.records.get(milestone.id)}
          />
        ))}
      </ul>
    </section>
  )
}
