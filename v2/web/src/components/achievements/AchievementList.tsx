import { useSuspenseQuery } from '@tanstack/react-query'
import { achievementSections, achievements } from '#/lib/achievements'
import {
  goalsQuery,
  legacyCheckInsQuery,
  meQuery,
  milestonesQuery,
  sessionsQuery,
} from '#/lib/queries'
import { AchievementBadge } from './AchievementBadge'

export function AchievementList() {
  const { data: sessions } = useSuspenseQuery(sessionsQuery)
  const { data: legacyCheckIns } = useSuspenseQuery(legacyCheckInsQuery)
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const { data: goals } = useSuspenseQuery(goalsQuery)
  const { data: me } = useSuspenseQuery(meQuery)
  const all = achievements(
    { sessions, legacyCheckIns, milestones, goals },
    me.weightUnit,
  )
  const unlocked = all.filter((achievement) => achievement.unlockedAt).length

  return (
    <div className="flex flex-col gap-8">
      <p className="font-heading text-lg">
        {unlocked} of {all.length} unlocked
      </p>
      {achievementSections(all).map((section) => (
        <section key={section.group} className="flex flex-col gap-3">
          <h2 className="font-heading text-xl">{section.group}</h2>
          <div className="flex flex-col gap-6">
            {section.series.map((run) => (
              <ul
                key={run[0].series}
                className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              >
                {run.map((achievement) => (
                  <AchievementBadge
                    key={achievement.code}
                    achievement={achievement}
                  />
                ))}
              </ul>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
