import { createFileRoute } from '@tanstack/react-router'
import { CurrentSession } from '#/components/sessions/CurrentSession'
import { SessionHistory } from '#/components/sessions/SessionHistory'
import { PageHeader } from '#/components/shared/PageHeader'

export const Route = createFileRoute('/_app/sessions/')({
  component: Sessions,
})

function Sessions() {
  return (
    <>
      <PageHeader title="Sessions" description="Every session you've logged." />
      <div className="flex flex-col gap-6">
        <CurrentSession />
        <SessionHistory />
      </div>
    </>
  )
}
