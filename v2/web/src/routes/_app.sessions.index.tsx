import { Link, createFileRoute } from '@tanstack/react-router'
import { ChartColumn } from 'lucide-react'
import { CurrentSession } from '#/components/sessions/CurrentSession'
import { SessionHistory } from '#/components/sessions/SessionHistory'
import { PageHeader } from '#/components/shared/PageHeader'
import { buttonVariants } from '#/components/ui/button'

export const Route = createFileRoute('/_app/sessions/')({
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
