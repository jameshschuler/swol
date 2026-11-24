import { Trophy } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '#/components/ui/dialog'
import { currentTier } from '#/lib/achievements'
import type { Achievement } from '#/lib/achievements'
import { formatShortDateWithYear } from '#/lib/format'
import { cn } from '#/lib/utils'
import { tierColor } from './achievement-styles'
import { AchievementDetails } from './AchievementDetails'

export function AchievementRow({ achievement }: { achievement: Achievement }) {
  const total = achievement.tiers.length
  const completedAt = currentTier(achievement)?.unlockedAt

  return (
    <Dialog>
      <DialogTrigger className="flex w-full items-center gap-3 rounded-base border-2 border-border bg-secondary-background p-2 text-left outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center rounded-base border-2 border-border text-black',
            tierColor(total, total),
          )}
        >
          <Trophy className="size-4" />
        </span>
        <span className="min-w-0 flex-1 truncate font-heading">
          {achievement.title}
        </span>
        {completedAt && (
          <span className="text-sm whitespace-nowrap tabular-nums">
            {formatShortDateWithYear(completedAt)}
          </span>
        )}
      </DialogTrigger>
      <DialogContent>
        <AchievementDetails achievement={achievement} />
      </DialogContent>
    </Dialog>
  )
}
