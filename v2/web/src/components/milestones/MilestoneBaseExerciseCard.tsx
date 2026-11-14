import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatLift } from '#/lib/milestones'
import type { BaseExerciseMilestones } from '#/lib/milestones'
import type { WeightUnit } from '#/types/api'
import { MilestoneVariation } from './MilestoneVariation'

export function MilestoneBaseExerciseCard({
  group,
  unit,
}: {
  group: BaseExerciseMilestones
  unit: WeightUnit
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="min-w-0 truncate">
          {group.baseExerciseName}
        </CardTitle>
        {group.base && (
          <CardAction className="font-heading whitespace-nowrap tabular-nums">
            {formatLift(group.base.best, unit)}
          </CardAction>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {group.base && (
          <MilestoneVariation
            variation={group.base}
            unit={unit}
            showHeading={false}
          />
        )}
        {group.variations.map((variation) => (
          <MilestoneVariation
            key={variation.exerciseId}
            variation={variation}
            unit={unit}
            showHeading
          />
        ))}
      </CardContent>
    </Card>
  )
}
