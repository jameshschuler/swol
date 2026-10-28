import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { formatLift, groupByExercise } from '#/lib/milestones'
import { meQuery, milestonesQuery } from '#/lib/queries'
import { MilestoneRow } from './MilestoneRow'

export function MilestoneList() {
  const { data: milestones, isPending, error } = useQuery(milestonesQuery)
  const { data: me } = useQuery(meQuery)
  const unit = me?.weightUnit ?? 'lb'

  if (isPending) {
    return <p>Loading…</p>
  }
  if (error) {
    return <p className="text-danger">{error.message}</p>
  }
  if (milestones.length === 0) {
    return <p>No milestones yet. Log your first one above.</p>
  }

  return groupByExercise(milestones).map((group) => (
    <Card key={group.exerciseId}>
      <CardHeader>
        <CardTitle>{group.exerciseName}</CardTitle>
        <CardAction className="font-heading tabular-nums">
          {formatLift(group.best, unit)}
        </CardAction>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {group.milestones.map((milestone) => (
            <MilestoneRow
              key={milestone.id}
              milestone={milestone}
              unit={unit}
              record={group.records.get(milestone.id)}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  ))
}
