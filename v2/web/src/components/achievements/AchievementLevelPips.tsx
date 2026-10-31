import { cn } from '#/lib/utils'
import { tierColor } from './achievement-styles'

export function AchievementLevelPips({
  unlocked,
  total,
}: {
  unlocked: number
  total: number
}) {
  return (
    <div className="flex w-full items-center gap-2">
      <div className="flex flex-1 gap-1">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={cn(
              'h-2 flex-1 rounded-[2px] border border-border',
              i < unlocked ? tierColor(i + 1, total) : 'bg-background',
            )}
          />
        ))}
      </div>
      <span className="text-xs tabular-nums">
        {unlocked}/{total}
      </span>
    </div>
  )
}
