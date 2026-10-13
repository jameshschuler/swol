import { Badge } from '#/components/ui/badge'
import type { SessionStatus } from '#/types/api'

const labels: Record<SessionStatus, string> = {
  active: 'In progress',
  paused: 'Paused',
  completed: 'Completed',
}

export function SessionStatusBadge({ status }: { status: SessionStatus }) {
  return (
    <Badge
      variant={status === 'active' ? 'default' : 'neutral'}
      className={status === 'active' ? 'bg-main text-main-foreground' : ''}
    >
      {labels[status]}
    </Badge>
  )
}
