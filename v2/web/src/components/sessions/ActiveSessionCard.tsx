import { Pause, Play, Square } from 'lucide-react'
import { ConfirmDialog } from '#/components/shared/ConfirmDialog'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { useSessionAction } from '#/hooks/useSessionMutations'
import { formatTime } from '#/lib/format'
import type { WorkoutSession } from '#/types/api'
import { SessionNotes } from './SessionNotes'
import { SessionStatusBadge } from './SessionStatusBadge'
import { SessionTimer } from './SessionTimer'

export function ActiveSessionCard({ session }: { session: WorkoutSession }) {
  const action = useSessionAction(session.id)
  const isPaused = session.status === 'paused'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current session</CardTitle>
        <CardAction>
          <SessionStatusBadge status={session.status} />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-6">
        <div>
          <SessionTimer session={session} />
          <p className="text-sm">Started at {formatTime(session.startedAt)}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            variant={isPaused ? 'default' : 'neutral'}
            disabled={action.isPending}
            onClick={() => action.mutate(isPaused ? 'resume' : 'pause')}
          >
            {isPaused ? <Play /> : <Pause />}
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <ConfirmDialog
            title="End this session?"
            description="The timer stops and the session moves to your history."
            confirmLabel="End session"
            onConfirm={() => action.mutate('end')}
            trigger={
              <Button variant="neutral" disabled={action.isPending}>
                <Square />
                End session
              </Button>
            }
          />
        </div>
        {action.error && <p className="text-danger">{action.error.message}</p>}
        <SessionNotes key={session.id} session={session} />
      </CardContent>
    </Card>
  )
}
