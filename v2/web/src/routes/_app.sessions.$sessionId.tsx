import { createFileRoute } from '@tanstack/react-router'
import { SessionDetail } from '#/components/sessions/SessionDetail'

export const Route = createFileRoute('/_app/sessions/$sessionId')({
  component: SessionPage,
})

function SessionPage() {
  const { sessionId } = Route.useParams()
  return <SessionDetail sessionId={sessionId} />
}
