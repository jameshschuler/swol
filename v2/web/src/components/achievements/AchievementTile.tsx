import { Lock, Medal, Trophy } from 'lucide-react'
import { Dialog, DialogContent, DialogTrigger } from '#/components/ui/dialog'
import { tierStatus, unlockedTiers } from '#/lib/achievements'
import type { Achievement } from '#/lib/achievements'
import { cn } from '#/lib/utils'
import { tierColor } from './achievement-styles'
import { AchievementDetails } from './AchievementDetails'
import { AchievementLevelPips } from './AchievementLevelPips'

export function AchievementTile({ achievement }: { achievement: Achievement }) {
  const unlocked = unlockedTiers(achievement)
  const total = achievement.tiers.length
  const Icon = unlocked === total ? Trophy : unlocked > 0 ? Medal : Lock

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          'flex aspect-square w-full flex-col items-start justify-between rounded-base border-2 border-border bg-secondary-background p-3 text-left outline-none transition-transform focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2',
          unlocked > 0
            ? 'shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none'
            : 'opacity-60',
        )}
      >
        <span
          className={cn(
            'flex size-10 items-center justify-center rounded-base border-2 border-border',
            unlocked > 0 && cn(tierColor(unlocked, total), 'text-black'),
          )}
        >
          <Icon className="size-5" />
        </span>
        <span className="flex w-full flex-col gap-2">
          <span className="flex flex-col">
            <span className="font-heading leading-tight">
              {achievement.title}
            </span>
            <span className="text-sm tabular-nums">
              {tierStatus(achievement)}
            </span>
          </span>
          <AchievementLevelPips unlocked={unlocked} total={total} />
        </span>
      </DialogTrigger>
      <DialogContent>
        <AchievementDetails achievement={achievement} />
      </DialogContent>
    </Dialog>
  )
}
