import { useSuspenseQuery } from '@tanstack/react-query'
import {
  achievementSections,
  achievements,
  unlockedTiers,
} from '#/lib/achievements'
import {
  goalsQuery,
  legacyCheckInsQuery,
  meQuery,
  milestonesQuery,
  sessionsQuery,
} from '#/lib/queries'
import { AchievementTile } from './AchievementTile'

export function AchievementList() {
  const { data: sessions } = useSuspenseQuery(sessionsQuery)
  const { data: legacyCheckIns } = useSuspenseQuery(legacyCheckInsQuery)
  const { data: milestones } = useSuspenseQuery(milestonesQuery)
  const { data: goals } = useSuspenseQuery(goalsQuery)
  const { data: me } = useSuspenseQuery(meQuery)
  const all = achievements(
    { sessions, legacyCheckIns, milestones, goals },
    me.weightUnit,
    new Date(),
  )
  const unlocked = all.reduce((sum, a) => sum + unlockedTiers(a), 0)
  const total = all.reduce((sum, a) => sum + a.tiers.length, 0)

  return (
    <div className="flex flex-col gap-8">
      <p className="font-heading text-lg">
        {unlocked} of {total} levels unlocked
      </p>
      {achievementSections(all).map((section) => (
        <section key={section.group} className="flex flex-col gap-3">
          <h2 className="font-heading text-xl">{section.group}</h2>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {section.achievements.map((achievement) => (
              <li key={achievement.code}>
                <AchievementTile achievement={achievement} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
