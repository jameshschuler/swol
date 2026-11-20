import { useSuspenseQuery } from '@tanstack/react-query'
import { LogMilestoneButton } from '#/components/milestones/LogMilestoneButton'
import { MilestoneVariation } from '#/components/milestones/MilestoneVariation'
import { PageHeader } from '#/components/shared/PageHeader'
import { StatTile } from '#/components/shared/StatTile'
import {
  bestOneRepMax,
  formatLift,
  groupByExercise,
  oneRepMaxHistory,
} from '#/lib/milestones'
import { exercisesQuery, meQuery, milestonesQuery } from '#/lib/queries'
import { formatWeight } from '#/lib/units'
import { OneRepMaxCard } from './OneRepMaxCard'

export function ExerciseHistory({ exerciseId }: { exerciseId: string }) {
  const { data: me } = useSuspenseQuery(meQuery)
  const { data: exercises } = useSuspenseQuery(exercisesQuery)
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const unit = me.weightUnit
  const exercise = exercises.find(({ id }) => id === exerciseId)

  if (!exercise) {
    return (
      <PageHeader
        title="Exercise not found"
        description="It may have been deleted."
      />
    )
  }

  const logged = milestones.filter((m) => m.exerciseId === exerciseId)
  const group = groupByExercise(logged).at(0)
  const best = bestOneRepMax(logged, unit)
  const baseName = exercises.find(
    ({ id }) => id === exercise.baseExerciseId,
  )?.name

  return (
    <>
      <PageHeader
        title={exercise.name}
        description={baseName && `Variation of ${baseName}`}
        action={<LogMilestoneButton exerciseId={exerciseId} />}
      />
      {group ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-3">
            <StatTile label="Best lift" value={formatLift(group.best, unit)} />
            <StatTile
              label="Estimated 1RM"
              value={best === null ? '—' : formatWeight(best, unit)}
            />
          </div>
          <OneRepMaxCard history={oneRepMaxHistory(logged, unit)} unit={unit} />
          <MilestoneVariation
            variation={group}
            unit={unit}
            showHeading={false}
          />
        </div>
      ) : (
        <p>
          No milestones for {exercise.name} yet. Log one to start tracking it.
        </p>
      )}
    </>
  )
}
