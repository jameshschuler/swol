import { describe, expect, it } from 'vitest'
import {
  achievementSections,
  achievements,
  currentTier,
  tierColorIndex,
  tierStatus,
  nextTier,
  progressToNextTier,
  unlockedTiers,
} from './achievements'
import type { AchievementData } from './achievements'
import { kgPerLb } from './units'
import type { Goal, Milestone, WeightUnit, WorkoutSession } from '#/types/api'

const at = (month: number, day: number, hour = 9) =>
  new Date(2026, month, day, hour).toISOString()

const session = (
  startedAt: string,
  overrides: Partial<WorkoutSession> = {},
): WorkoutSession => ({
  id: startedAt,
  kind: 'check_in',
  status: 'completed',
  startedAt,
  pausedAt: null,
  pausedSeconds: 0,
  endedAt: startedAt,
  notes: null,
  createdAt: startedAt,
  ...overrides,
})

const lift = (
  exerciseName: string,
  lb: number,
  reps: number,
  achievedAt: string,
  unit: WeightUnit = 'lb',
): Milestone => ({
  id: `${exerciseName}-${lb}-${reps}-${achievedAt}`,
  exerciseId: exerciseName,
  exerciseName,
  weight: unit === 'lb' ? lb : lb * kgPerLb,
  unit,
  weightKg: lb * kgPerLb,
  reps,
  achievedAt,
  note: null,
})

const goal = (overrides: Partial<Goal>): Goal => ({
  id: 'g',
  exerciseId: 'bench',
  exerciseName: 'Bench Press',
  targetWeight: 225,
  unit: 'lb',
  targetWeightKg: 225 * kgPerLb,
  targetReps: 1,
  completedAt: null,
  completedMilestoneId: null,
  createdAt: at(0, 1),
  ...overrides,
})

const now = new Date(2026, 11, 31)
const none: AchievementData = {
  sessions: [],
  legacyCheckIns: [],
  milestones: [],
  goals: [],
}

const find = (
  code: string,
  data: Partial<AchievementData> = {},
  unit: WeightUnit = 'lb',
) => {
  const found = achievements({ ...none, ...data }, unit, now).find(
    (achievement) => achievement.code === code,
  )
  if (!found) {
    throw new Error(`no achievement ${code}`)
  }
  return found
}

const unlockedAt = (
  code: string,
  target: number,
  data: Partial<AchievementData>,
) => {
  const tier = find(code, data).tiers.find((t) => t.target === target)
  if (!tier) {
    throw new Error(`no ${code} tier ${target}`)
  }
  return tier.unlockedAt
}

describe('achievements', () => {
  it('starts with everything locked and unique codes', () => {
    const all = achievements(none, 'lb', now)
    expect(all.every((achievement) => unlockedTiers(achievement) === 0)).toBe(
      true,
    )
    expect(new Set(all.map((achievement) => achievement.code)).size).toBe(
      all.length,
    )
  })

  it('counts each gym day once, including legacy check-ins', () => {
    const sessions = Array.from({ length: 9 }, (_, i) => session(at(0, i + 1)))
    sessions.push(session(at(0, 9, 18)))
    const legacyCheckIns = [{ id: 1, checkedInAt: at(0, 12) }]
    expect(unlockedAt('visits', 1, { sessions })).toEqual(new Date(2026, 0, 1))
    expect(unlockedAt('visits', 10, { sessions })).toBeNull()
    expect(unlockedAt('visits', 10, { sessions, legacyCheckIns })).toEqual(
      new Date(2026, 0, 12),
    )
  })

  it('ignores sessions still in progress', () => {
    const sessions = [session(at(0, 1), { kind: 'workout', status: 'active' })]
    expect(unlockedAt('visits', 1, { sessions })).toBeNull()
  })

  it('unlocks a streak on the first visit of its last week', () => {
    const sessions = [
      session(at(0, 5)),
      session(at(0, 14)),
      session(at(0, 13)),
      session(at(0, 21)),
      session(at(0, 28)),
    ]
    expect(unlockedAt('streak', 4, { sessions })).toEqual(new Date(2026, 0, 28))
  })

  it('restarts a streak after a week off', () => {
    const sessions = [at(0, 5), at(0, 12), at(0, 26), at(1, 2), at(1, 9)].map(
      (time) => session(time),
    )
    expect(unlockedAt('streak', 4, { sessions })).toBeNull()
  })

  it('unlocks hours trained from completed workouts only', () => {
    const workout = (day: number, hours: number) =>
      session(at(0, day, 0), {
        kind: 'workout',
        endedAt: at(0, day, hours),
      })
    const sessions = [
      ...Array.from({ length: 4 }, (_, i) => workout(i + 1, 24)),
      workout(5, 3),
      workout(6, 1),
    ]
    expect(unlockedAt('hours', 6000, { sessions })).toEqual(
      new Date(at(0, 6, 1)),
    )
    expect(
      unlockedAt('hours', 6000, { sessions: sessions.slice(0, 5) }),
    ).toBeNull()
  })

  it('unlocks a club when the best singles add up', () => {
    const milestones = [
      lift('Squat', 400, 1, at(0, 1)),
      lift('Bench Press', 250, 1, at(0, 2)),
      lift('Deadlift', 340, 1, at(0, 3)),
      lift('Deadlift', 350, 1, at(0, 4)),
    ]
    expect(unlockedAt('club', 1000, { milestones })).toEqual(new Date(at(0, 4)))
    expect(unlockedAt('club', 1200, { milestones })).toBeNull()
  })

  it('needs singles on all three lifts for a club', () => {
    const milestones = [
      lift('Squat', 500, 1, at(0, 1)),
      lift('Deadlift', 600, 1, at(0, 2)),
      lift('Bench Press', 300, 3, at(0, 3)),
    ]
    expect(unlockedAt('club', 1000, { milestones })).toBeNull()
  })

  it('counts lifts logged in kilograms', () => {
    const milestones = [
      lift('Squat', 405, 1, at(0, 1), 'kg'),
      lift('Bench Press', 275, 1, at(0, 1), 'kg'),
      lift('Deadlift', 520, 1, at(0, 1), 'kg'),
    ]
    expect(unlockedAt('club', 1200, { milestones })).not.toBeNull()
    expect(unlockedAt('squat', 405, { milestones })).not.toBeNull()
  })

  it('unlocks lift badges for any reps and matches names in any case', () => {
    const milestones = [lift('bench press', 225, 5, at(0, 3))]
    expect(unlockedAt('bench-press', 225, { milestones })).toEqual(
      new Date(at(0, 3)),
    )
    expect(unlockedAt('bench-press', 135, { milestones })).toEqual(
      new Date(at(0, 3)),
    )
    expect(unlockedAt('bench-press', 275, { milestones })).toBeNull()
    expect(unlockedAt('squat', 225, { milestones })).toBeNull()
  })

  it('unlocks on the first lift that reaches the weight', () => {
    const milestones = [
      lift('Deadlift', 500, 1, at(0, 9)),
      lift('Deadlift', 405, 3, at(0, 2)),
    ]
    expect(unlockedAt('deadlift', 405, { milestones })).toEqual(
      new Date(at(0, 2)),
    )
  })

  it('shows weights in the chosen unit', () => {
    const bench = find(
      'bench-press',
      { milestones: [lift('Bench Press', 245, 3, at(0, 1))] },
      'kg',
    )
    expect(bench.tiers[1].label).toBe('102.1 kg')
    expect(bench.progress?.label).toBe('Best: 111.1 kg')
    expect(find('club', {}, 'kg').tiers[0].label).toBe('1,000 lb club')
  })

  it('counts milestones and goals', () => {
    const milestones = Array.from({ length: 10 }, (_, i) =>
      lift('Squat', 100 + i, 5, at(1, i + 1)),
    )
    const goals = [
      goal({ id: 'a', createdAt: at(0, 3), completedAt: at(1, 5) }),
      goal({ id: 'b', createdAt: at(0, 2) }),
    ]
    expect(unlockedAt('milestones', 10, { milestones })).toEqual(
      new Date(at(1, 10)),
    )
    expect(unlockedAt('milestones', 50, { milestones })).toBeNull()
    expect(unlockedAt('goal-set', 1, { goals })).toEqual(new Date(at(0, 2)))
    expect(unlockedAt('goals-done', 1, { goals })).toEqual(new Date(at(1, 5)))
    expect(unlockedAt('goals-done', 10, { goals })).toBeNull()
  })

  it('unlocks the ladder badge when every goal on an exercise is done', () => {
    const goals = [
      goal({ id: 'a', targetWeightKg: 100, completedAt: at(1, 5) }),
      goal({ id: 'b', targetWeightKg: 120, completedAt: at(2, 5) }),
      goal({ id: 'c', exerciseId: 'squat', completedAt: at(0, 5) }),
    ]
    expect(unlockedAt('ladder-done', 1, { goals })).toEqual(new Date(at(2, 5)))
  })

  it('keeps the ladder badge locked while a goal is open', () => {
    const goals = [
      goal({ id: 'a', completedAt: at(1, 5) }),
      goal({ id: 'b', targetWeightKg: 120 }),
    ]
    expect(unlockedAt('ladder-done', 1, { goals })).toBeNull()
  })
})

describe('achievementSections', () => {
  it('groups achievements in order', () => {
    const sections = achievementSections(achievements(none, 'lb', now))
    expect(sections.map((section) => section.group)).toEqual([
      'Showing up',
      'Strength',
      'Goals and milestones',
    ])
    expect(sections[0].achievements[0].code).toBe('visits')
  })

  it('returns nothing for no achievements', () => {
    expect(achievementSections([])).toEqual([])
  })
})

describe('tier progress', () => {
  const sessions = Array.from({ length: 30 }, (_, i) =>
    session(new Date(2026, 0, 1 + i, 9).toISOString()),
  )

  it('counts unlocked tiers and finds the next one', () => {
    const visits = find('visits', { sessions })
    expect(unlockedTiers(visits)).toBe(2)
    expect(nextTier(visits)?.target).toBe(50)
    expect(visits.progress).toEqual({ current: 30, label: '30 visits' })
  })

  it('measures progress toward the next tier', () => {
    expect(progressToNextTier(find('visits', { sessions }))).toBe(60)
  })

  it('has no next tier once every tier is unlocked', () => {
    const comeback = find('comeback', {
      sessions: [session(at(0, 1)), session(at(2, 1))],
    })
    expect(nextTier(comeback)).toBeNull()
    expect(progressToNextTier(comeback)).toBeNull()
  })

  it('has no progress bar for yes-or-no achievements', () => {
    expect(progressToNextTier(find('pr-month'))).toBeNull()
  })

  it('starts at zero with nothing logged', () => {
    const tomPlatz = find('tom-platz', {
      milestones: [lift('Front Squat', 95, 30, at(0, 1))],
    })
    expect(progressToNextTier(tomPlatz)).toBe(0)
  })

  it('sums the best singles for the club', () => {
    const club = find('club', {
      milestones: [
        lift('Squat', 400, 1, at(0, 1)),
        lift('Squat', 450, 3, at(0, 2)),
        lift('Bench Press', 250, 1, at(0, 3)),
      ],
    })
    expect(club.progress).toEqual({ current: 650, label: 'Total: 650 lb' })
  })
})

describe('more achievements', () => {
  const visit = (date: Date) => session(date.toISOString())
  const workout = (start: string, minutes: number) =>
    session(start, {
      kind: 'workout',
      endedAt: new Date(Date.parse(start) + minutes * 60_000).toISOString(),
    })

  it('unlocks a comeback after four weeks off', () => {
    const tooSoon = [at(0, 1), at(0, 29)].map((time) => session(time))
    const back = [at(0, 1), at(0, 30), at(1, 2)].map((time) => session(time))
    expect(unlockedAt('comeback', 1, { sessions: tooSoon })).toBeNull()
    expect(unlockedAt('comeback', 1, { sessions: back })).toEqual(
      new Date(2026, 0, 30),
    )
  })

  it('unlocks year of iron on the 100th visit in one calendar year', () => {
    const lateLastYear = Array.from({ length: 60 }, (_, i) =>
      visit(new Date(2025, 9, 1 + i, 9)),
    )
    const thisYear = Array.from({ length: 100 }, (_, i) =>
      visit(new Date(2026, 0, 1 + i, 9)),
    )
    expect(
      unlockedAt('year-of-iron', 100, {
        sessions: [...lateLastYear, ...thisYear.slice(0, 99)],
      }),
    ).toBeNull()
    expect(unlockedAt('year-of-iron', 100, { sessions: thisYear })).toEqual(
      new Date(2026, 0, 100),
    )
  })

  it('unlocks long haul for a workout of two hours or more', () => {
    expect(
      unlockedAt('long-haul', 120, { sessions: [workout(at(0, 1), 119)] }),
    ).toBeNull()
    expect(
      unlockedAt('long-haul', 120, {
        sessions: [workout(at(0, 1), 119), workout(at(0, 2), 120)],
      }),
    ).toEqual(new Date(Date.parse(at(0, 2)) + 120 * 60_000))
  })

  it('unlocks the 500 hours tier', () => {
    const sessions = Array.from({ length: 250 }, (_, i) =>
      workout(new Date(2026, 0, 1 + i, 9).toISOString(), 120),
    )
    expect(unlockedAt('hours', 30000, { sessions })).not.toBeNull()
    expect(
      unlockedAt('hours', 30000, { sessions: sessions.slice(0, 249) }),
    ).toBeNull()
  })

  it('keeps lift variations apart from the main lifts', () => {
    const milestones = [
      lift('Paused Bench Press', 275, 1, at(0, 1)),
      lift('Front Squat', 315, 1, at(0, 2)),
    ]
    expect(unlockedAt('paused-bench-press', 275, { milestones })).not.toBeNull()
    expect(unlockedAt('bench-press', 275, { milestones })).toBeNull()
    expect(unlockedAt('front-squat', 315, { milestones })).not.toBeNull()
    expect(unlockedAt('squat', 315, { milestones })).toBeNull()
  })

  it('gives lift variations the same levels as the main lift', () => {
    const levels = (code: string) => find(code).tiers.map((t) => t.target)
    expect(levels('front-squat')).toEqual(levels('squat'))
    expect(levels('paused-bench-press')).toEqual(levels('bench-press'))
  })

  it('unlocks overhead press and power clean badges', () => {
    const milestones = [
      lift('Overhead Press', 185, 3, at(0, 1)),
      lift('Power Clean', 225, 1, at(0, 2)),
    ]
    expect(unlockedAt('overhead-press', 185, { milestones })).toEqual(
      new Date(at(0, 1)),
    )
    expect(unlockedAt('overhead-press', 225, { milestones })).toBeNull()
    expect(unlockedAt('power-clean', 225, { milestones })).toEqual(
      new Date(at(0, 2)),
    )
  })

  it('unlocks Tom Platz for a 23-rep back squat only', () => {
    expect(
      unlockedAt('tom-platz', 23, {
        milestones: [
          lift('Squat', 225, 22, at(0, 1)),
          lift('Front Squat', 95, 23, at(0, 2)),
        ],
      }),
    ).toBeNull()
    expect(
      unlockedAt('tom-platz', 23, {
        milestones: [lift('Squat', 135, 23, at(0, 3))],
      }),
    ).toEqual(new Date(at(0, 3)))
  })

  it('unlocks all-rounder on the fifth different exercise', () => {
    const milestones = [
      'Squat',
      'Squat',
      'Bench Press',
      'Deadlift',
      'Overhead Press',
      'Front Squat',
    ].map((name, i) => lift(name, 100 + i, 5, at(0, i + 1)))
    expect(unlockedAt('all-rounder', 5, { milestones })).toEqual(
      new Date(at(0, 6)),
    )
    expect(
      unlockedAt('all-rounder', 5, { milestones: milestones.slice(0, 5) }),
    ).toBeNull()
  })

  it('unlocks PR month when all three big lifts land in one month', () => {
    const spread = [
      lift('Squat', 300, 1, at(0, 5)),
      lift('Bench Press', 200, 1, at(0, 20)),
      lift('Deadlift', 400, 1, at(1, 1)),
    ]
    expect(unlockedAt('pr-month', 1, { milestones: spread })).toBeNull()
    expect(
      unlockedAt('pr-month', 1, {
        milestones: [...spread, lift('Deadlift', 405, 1, at(0, 31))],
      }),
    ).toEqual(new Date(at(0, 31)))
  })

  it('unlocks the 25 goals done tier', () => {
    const goals = Array.from({ length: 25 }, (_, i) =>
      goal({ id: String(i), completedAt: at(1, i + 1) }),
    )
    expect(unlockedAt('goals-done', 25, { goals })).toEqual(new Date(at(1, 25)))
    expect(unlockedAt('goals-done', 50, { goals })).toBeNull()
  })
})

describe('tier labels and colors', () => {
  it('shows the highest unlocked level', () => {
    const bench = find('bench-press', {
      milestones: [lift('Bench Press', 230, 1, at(0, 1))],
    })
    expect(currentTier(bench)?.label).toBe('225 lb')
    expect(tierStatus(bench)).toBe('225 lb')
  })

  it('shows the first level when nothing is unlocked', () => {
    const bench = find('bench-press')
    expect(currentTier(bench)).toBeNull()
    expect(tierStatus(bench)).toBe('Next: 135 lb')
  })

  it('says unlocked or locked for single-level achievements', () => {
    expect(tierStatus(find('pr-month'))).toBe('Locked')
    expect(
      tierStatus(
        find('comeback', { sessions: [session(at(0, 1)), session(at(2, 1))] }),
      ),
    ).toBe('Unlocked')
  })

  it.each([
    [1, [4]],
    [2, [0, 4]],
    [3, [0, 2, 4]],
    [4, [0, 1, 3, 4]],
    [5, [0, 1, 2, 3, 4]],
    [7, [0, 1, 1, 2, 3, 3, 4]],
  ])('spreads %i levels across the colors', (count, colors) => {
    expect(
      Array.from({ length: count }, (_, i) => tierColorIndex(i + 1, count, 5)),
    ).toEqual(colors)
  })
})
