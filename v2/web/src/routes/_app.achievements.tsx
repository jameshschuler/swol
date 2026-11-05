import { createFileRoute } from '@tanstack/react-router'
import { AchievementList } from '#/components/achievements/AchievementList'
import { PageHeader } from '#/components/shared/PageHeader'
import { PageLoadError } from '#/components/shared/PageLoadError'
import {
  goalsQuery,
  legacyCheckInsQuery,
  meQuery,
  milestonesQuery,
  sessionsQuery,
} from '#/lib/queries'

export const Route = createFileRoute('/_app/achievements')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.query({ ...meQuery, staleTime: 'static' }),
      queryClient.query({ ...sessionsQuery, staleTime: 'static' }),
      queryClient.query({ ...legacyCheckInsQuery, staleTime: 'static' }),
      queryClient.query({ ...goalsQuery, staleTime: 'static' }),
      queryClient.query({ ...milestonesQuery, staleTime: 'static' }),
    ]),
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: PageLoadError,
  component: Achievements,
})

function Achievements() {
  return (
    <>
      <PageHeader
        title="Achievements"
        description="Badges for showing up and putting in work."
      />
      <AchievementList />
    </>
  )
}
