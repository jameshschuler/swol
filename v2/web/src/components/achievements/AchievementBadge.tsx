import { Lock, Medal } from 'lucide-react'
import type { Achievement } from '#/lib/achievements'
import { formatDate } from '#/lib/format'
import { cn } from '#/lib/utils'

export function AchievementBadge({
  achievement,
}: {
  achievement: Achievement
}) {
  const { title, description, unlockedAt } = achievement

  return (
    <li
      className={cn(
        'flex gap-3 rounded-base border-2 border-border bg-secondary-background p-3',
        unlockedAt ? 'shadow-shadow' : 'opacity-60',
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-base border-2 border-border',
          unlockedAt && 'bg-main text-main-foreground',
        )}
      >
        {unlockedAt ? (
          <Medal className="size-5" />
        ) : (
          <Lock className="size-5" />
        )}
      </span>
      <div className="min-w-0">
        <p className="font-heading">{title}</p>
        <p className="text-sm">{description}</p>
        {unlockedAt && (
          <p className="mt-1 text-xs">{formatDate(unlockedAt.toISOString())}</p>
        )}
      </div>
    </li>
  )
}
