import { Check, Lock } from 'lucide-react'
import type { AchievementTier } from '#/lib/achievements'
import { formatDate } from '#/lib/format'
import { cn } from '#/lib/utils'
import { tierColor } from './achievement-styles'

export function AchievementTierRow({
  tier,
  level,
  tierCount,
}: {
  tier: AchievementTier
  level: number
  tierCount: number
}) {
  return (
    <li
      className={cn(
        'flex items-center gap-3 rounded-base border-2 border-border p-2',
        tier.unlockedAt ? 'bg-secondary-background' : 'opacity-60',
      )}
    >
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-base border-2 border-border',
          tier.unlockedAt && cn(tierColor(level, tierCount), 'text-black'),
        )}
      >
        {tier.unlockedAt ? (
          <Check className="size-4" />
        ) : (
          <Lock className="size-4" />
        )}
      </span>
      <div className="min-w-0">
        <p className="font-heading">
          Level {level} · {tier.label}
        </p>
        <p className="text-xs">
          {tier.unlockedAt
            ? formatDate(tier.unlockedAt.toISOString())
            : 'Locked'}
        </p>
      </div>
    </li>
  )
}
