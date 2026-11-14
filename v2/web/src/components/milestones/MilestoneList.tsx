import { useSuspenseQuery } from '@tanstack/react-query'
import { groupByBaseExercise } from '#/lib/milestones'
import { meQuery, milestonesQuery } from '#/lib/queries'
import { MilestoneBaseExerciseCard } from './MilestoneBaseExerciseCard'

export function MilestoneList() {
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const { data: me } = useSuspenseQuery(meQuery)

  if (milestones.length === 0) {
    return <p>No milestones yet. Log your first one above.</p>
  }

  return groupByBaseExercise(milestones).map((group) => (
    <MilestoneBaseExerciseCard
      key={group.baseExerciseId}
      group={group}
      unit={me.weightUnit}
    />
  ))
}
