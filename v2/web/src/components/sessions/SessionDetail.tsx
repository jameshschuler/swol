import { Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { PageHeader } from '#/components/shared/PageHeader'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { useDeleteSession } from '#/hooks/useSessionMutations'
import { formatDate, formatDuration } from '#/lib/format'
import { sessionQuery } from '#/lib/queries'
import { elapsedSeconds, sessionTimes } from '#/lib/sessions'
import { SessionNotes } from './SessionNotes'
import { SessionStatusBadge } from './SessionStatusBadge'
import { SessionTimer } from './SessionTimer'

export function SessionDetail({ sessionId }: { sessionId: string }) {
  const { data: session, isPending, error } = useQuery(sessionQuery(sessionId))
  const deleteSession = useDeleteSession(sessionId)
  const isCheckIn = session?.kind === 'check_in'

  return (
    <>
      <Link
        to="/sessions"
        className="mb-4 inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft className="size-4" />
        All sessions
      </Link>
      {isPending && <p>Loading…</p>}
      {error && <p className="text-danger">{error.message}</p>}
      {session && (
        <>
          <PageHeader
            title={formatDate(session.startedAt)}
            description={sessionTimes(session)}
          />
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{isCheckIn ? 'Check-in' : 'Duration'}</CardTitle>
                {!isCheckIn && (
                  <CardAction>
                    <SessionStatusBadge status={session.status} />
                  </CardAction>
                )}
              </CardHeader>
              <CardContent className="flex flex-col gap-6">
                {!isCheckIn &&
                  (session.status === 'completed' ? (
                    <p className="font-heading text-5xl tabular-nums">
                      {formatDuration(elapsedSeconds(session, Date.now()))}
                    </p>
                  ) : (
                    <SessionTimer session={session} />
                  ))}
                <SessionNotes key={session.id} session={session} />
              </CardContent>
            </Card>
            <ConfirmDialog
              title="Delete this session?"
              description="The session and its notes are removed for good."
              confirmLabel="Delete"
              onConfirm={() => deleteSession.mutate()}
              trigger={
                <Button
                  variant="neutral"
                  className="self-start"
                  disabled={deleteSession.isPending}
                >
                  <Trash2 />
                  Delete session
                </Button>
              }
            />
            {deleteSession.error && (
              <p className="text-danger">{deleteSession.error.message}</p>
            )}
          </div>
        </>
      )}
    </>
  )
}
