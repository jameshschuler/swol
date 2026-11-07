import { createFileRoute } from '@tanstack/react-router'
import { DashboardGoals } from '#/components/dashboard/DashboardGoals'
import { DashboardMilestones } from '#/components/dashboard/DashboardMilestones'
import { DashboardWeek } from '#/components/dashboard/DashboardWeek'
import { CurrentSession } from '#/components/sessions/CurrentSession'
import { PageHeader } from '#/components/shared/PageHeader'
import { PageLoadError } from '#/components/shared/PageLoadError'
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
      queryClient.query({ ...meQuery, staleTime: 'static' }),
      queryClient.query({ ...currentSessionQuery, staleTime: 'static' }),
      queryClient.query({ ...sessionsQuery, staleTime: 'static' }),
      queryClient.query({ ...legacyCheckInsQuery, staleTime: 'static' }),
      queryClient.query({ ...goalsQuery, staleTime: 'static' }),
      queryClient.query({ ...milestonesQuery, staleTime: 'static' }),
    ]),
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: PageLoadError,
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
