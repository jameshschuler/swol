import { Dialog, DialogContent, DialogTrigger } from '#/components/ui/dialog'
import { currentTier } from '#/lib/achievements'
import type { Achievement } from '#/lib/achievements'
import { formatShortDateWithYear } from '#/lib/format'
import { AchievementDetails } from './AchievementDetails'

export function AchievementRow({ achievement }: { achievement: Achievement }) {
  const completedAt = currentTier(achievement)?.unlockedAt

  return (
    <Dialog>
      <DialogTrigger className="flex w-full items-center gap-3 rounded-base border-2 border-border bg-secondary-background p-3 text-left outline-none hover:bg-background focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2">
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
