import { useQuery } from '@tanstack/react-query'
import { goalProgress } from '#/lib/goals'
import { goalsQuery, meQuery, milestonesQuery } from '#/lib/queries'
import { GoalCard } from './GoalCard'

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

  const open = goals.data.filter((goal) => !goal.completedAt)
  const completed = goals.data.filter((goal) => goal.completedAt)
  const sections = [
    { title: 'Open', goals: open },
    { title: 'Completed', goals: completed },
  ].filter((section) => section.goals.length > 0)

  return sections.map((section) => (
    <section key={section.title} className="flex flex-col gap-3">
      <h2 className="font-heading text-xl">{section.title}</h2>
      {section.goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          progress={goalProgress(goal, milestones.data)}
          unit={unit}
        />
      ))}
    </section>
  ))
}
