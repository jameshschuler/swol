import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { PageHeader } from '#/components/shared/PageHeader'
import { StatsView } from '#/components/stats/StatsView'

export const Route = createFileRoute('/_app/sessions/stats')({
  component: Stats,
})

function Stats() {
  return (
    <>
      <Link
        to="/sessions"
        className="mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        All sessions
      </Link>
      <PageHeader title="Stats" description="How often you show up." />
      <StatsView />
    </>
  )
}
