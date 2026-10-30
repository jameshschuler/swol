import { createFileRoute } from '@tanstack/react-router'
import { DashboardError } from '#/components/dashboard/DashboardError'
import { DashboardGoals } from '#/components/dashboard/DashboardGoals'
import { DashboardMilestones } from '#/components/dashboard/DashboardMilestones'
import { DashboardWeek } from '#/components/dashboard/DashboardWeek'
import { CurrentSession } from '#/components/sessions/CurrentSession'
import { PageHeader } from '#/components/shared/PageHeader'
import {
  currentSessionQuery,
  goalsQuery,
  legacyCheckInsQuery,
  meQuery,
  milestonesQuery,
  sessionsQuery,
} from '#/lib/queries'

export const Route = createFileRoute('/_app/dashboard')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(meQuery),
      queryClient.ensureQueryData(currentSessionQuery),
      queryClient.ensureQueryData(sessionsQuery),
      queryClient.ensureQueryData(legacyCheckInsQuery),
      queryClient.ensureQueryData(goalsQuery),
      queryClient.ensureQueryData(milestonesQuery),
    ]),
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: DashboardError,
  component: Dashboard,
})

function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" description="Your training at a glance." />
      <div className="flex flex-col gap-6">
        <CurrentSession />
        <DashboardWeek />
        <div className="grid gap-6 md:grid-cols-2">
          <DashboardGoals />
          <DashboardMilestones />
        </div>
      </div>
    </>
  )
}
