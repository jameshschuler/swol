import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Progress } from '#/components/ui/progress'
import { nextTier, progressToNextTier } from '#/lib/achievements'
import type { Achievement } from '#/lib/achievements'
import { AchievementTierRow } from './AchievementTierRow'

export function AchievementDetails({
  achievement,
}: {
  achievement: Achievement
}) {
  const next = nextTier(achievement)
  const percent = progressToNextTier(achievement)

  return (
    <>
      <DialogHeader>
        <DialogTitle>{achievement.title}</DialogTitle>
        <DialogDescription>{achievement.description}</DialogDescription>
      </DialogHeader>
      {achievement.progress && (
        <div className="flex flex-col gap-2">
          <p className="font-heading tabular-nums">
            {achievement.progress.label}
          </p>
          {next && percent !== null && (
            <>
              <Progress value={percent} aria-label="Progress to next level" />
              <p className="text-sm">Next: {next.label}</p>
            </>
          )}
        </div>
      )}
      <ol className="flex max-h-[50dvh] flex-col gap-2 overflow-y-auto">
        {achievement.tiers.map((tier, i) => (
          <AchievementTierRow
            key={tier.label}
            tier={tier}
            level={i + 1}
            tierCount={achievement.tiers.length}
          />
        ))}
      </ol>
    </>
  )
}
