import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { goalProgress } from '#/lib/goals'
import type { GoalLadder } from '#/lib/goals'
import type { Milestone, WeightUnit } from '#/types/api'
import { GoalRow } from './GoalRow'

export function GoalLadderCard({
  ladder,
  milestones,
  unit,
}: {
  ladder: GoalLadder
  milestones: Milestone[]
  unit: WeightUnit
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{ladder.exerciseName}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {ladder.goals.map((goal) => (
            <GoalRow
              key={goal.id}
              goal={goal}
              progress={goalProgress(goal, milestones)}
              unit={unit}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
