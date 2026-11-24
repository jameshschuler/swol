import { Link, createFileRoute } from '@tanstack/react-router'
import { ChartColumn } from 'lucide-react'
import { CurrentSession } from '#/components/sessions/CurrentSession'
import { SessionHistory } from '#/components/sessions/SessionHistory'
import { PageHeader } from '#/components/shared/PageHeader'
import { PageLoadError } from '#/components/shared/PageLoadError'
import { buttonVariants } from '#/components/ui/button'
import {
  currentSessionQuery,
  legacyCheckInsQuery,
  sessionsQuery,
} from '#/lib/queries'

export const Route = createFileRoute('/_app/sessions/')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.query({ ...currentSessionQuery, staleTime: 'static' }),
      queryClient.query({ ...sessionsQuery, staleTime: 'static' }),
      queryClient.query({ ...legacyCheckInsQuery, staleTime: 'static' }),
    ]),
  pendingComponent: () => <p>Loading…</p>,
  errorComponent: PageLoadError,
  component: Sessions,
})

function Sessions() {
  return (
    <>
      <PageHeader
        title="Sessions"
        description="Every session you've logged."
        action={
          <Link
            to="/sessions/stats"
            className={buttonVariants({ variant: 'neutral' })}
          >
            <ChartColumn />
            Stats
          </Link>
        }
      />
      <div className="flex flex-col gap-6">
        <CurrentSession />
        <SessionHistory />
      </div>
    </>
  )
}
