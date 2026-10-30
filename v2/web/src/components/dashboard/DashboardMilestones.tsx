import { useSuspenseQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { formatDate } from '#/lib/format'
import { formatLift } from '#/lib/milestones'
import { meQuery, milestonesQuery } from '#/lib/queries'
import { DashboardCardLink } from './DashboardCardLink'

export function DashboardMilestones() {
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const { data: me } = useSuspenseQuery(meQuery)
  const unit = me.weightUnit

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent milestones</CardTitle>
        <DashboardCardLink to="/milestones" label="All milestones" />
      </CardHeader>
      <CardContent>
        {milestones.length === 0 ? (
          <p>No milestones yet. Log one on the milestones page.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {milestones.slice(0, 3).map((milestone) => (
              <li
                key={milestone.id}
                className="rounded-base border-2 border-border bg-secondary-background p-3"
              >
                <p className="font-heading">{milestone.exerciseName}</p>
                <p className="text-sm tabular-nums">
                  {formatLift(milestone, unit)}
                </p>
                <p className="text-sm">{formatDate(milestone.achievedAt)}</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
