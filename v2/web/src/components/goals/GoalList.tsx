import { useQuery } from '@tanstack/react-query'
import { goalLadders } from '#/lib/goals'
import { goalsQuery, meQuery, milestonesQuery } from '#/lib/queries'
import { GoalLadderCard } from './GoalLadderCard'

export function GoalList() {
  const goals = useQuery(goalsQuery)
  const milestones = useQuery(milestonesQuery)
  const { data: me } = useQuery(meQuery)
  const unit = me?.weightUnit ?? 'lb'
  const error = goals.error ?? milestones.error

  if (error) {
    return <p className="text-danger">{error.message}</p>
  }
  if (!goals.data || !milestones.data) {
    return <p>Loading…</p>
  }
  if (goals.data.length === 0) {
    return <p>No goals yet. Set your first one above.</p>
  }

  const sections = [
    { title: 'Open', goals: goals.data.filter((goal) => !goal.completedAt) },
    {
      title: 'Completed',
      goals: goals.data.filter((goal) => goal.completedAt),
    },
  ].filter((section) => section.goals.length > 0)

  return sections.map((section) => (
    <section key={section.title} className="flex flex-col gap-3">
      <h2 className="font-heading text-xl">{section.title}</h2>
      {goalLadders(section.goals).map((ladder) => (
        <GoalLadderCard
          key={ladder.exerciseId}
          ladder={ladder}
          milestones={milestones.data}
          unit={unit}
        />
      ))}
    </section>
  ))
}
