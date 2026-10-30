import { useSuspenseQuery } from '@tanstack/react-query'
import { PartyPopper } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { closestGoals, formatGoalTarget, goalStatus } from '#/lib/goals'
import { goalsQuery, meQuery, milestonesQuery } from '#/lib/queries'
import { cn } from '#/lib/utils'
import { DashboardCardLink } from './DashboardCardLink'

export function DashboardGoals() {
  const { data: goals } = useSuspenseQuery(goalsQuery)
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const { data: me } = useSuspenseQuery(meQuery)
  const unit = me.weightUnit
  const closest = closestGoals(goals, milestones, 3)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Closest goals</CardTitle>
        <DashboardCardLink to="/goals" label="All goals" />
      </CardHeader>
      <CardContent>
        {closest.length === 0 ? (
          <p>No open goals. Set one on the goals page.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {closest.map(({ goal, progress }) => (
              <li
                key={goal.id}
                className={cn(
                  'rounded-base border-2 border-border p-3',
                  progress.hitBy
                    ? 'bg-main text-main-foreground'
                    : 'bg-secondary-background',
                )}
              >
                <p className="font-heading">{goal.exerciseName}</p>
                <p className="text-sm tabular-nums">
                  {formatGoalTarget(goal, unit)}
                </p>
                <p className="flex items-center gap-2 text-sm tabular-nums">
                  {progress.hitBy && <PartyPopper className="size-4" />}
                  {goalStatus(goal, progress, unit) ?? 'Hit it! Mark it done'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
