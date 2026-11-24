import { createFileRoute } from '@tanstack/react-router'
import { BackLink } from '#/components/shared/BackLink'
import { PageHeader } from '#/components/shared/PageHeader'
import { StatsView } from '#/components/stats/StatsView'

export const Route = createFileRoute('/_app/sessions/stats')({
  component: Stats,
})

function Stats() {
  return (
    <>
      <BackLink to="/sessions" label="All sessions" />
      <PageHeader title="Stats" description="How often you show up." />
      <StatsView />
    </>
  )
}
