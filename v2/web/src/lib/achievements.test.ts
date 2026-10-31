import { describe, expect, it } from 'vitest'
import { achievementSections, achievements } from './achievements'
import type { Achievement, AchievementData } from './achievements'
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

const unlockedAt = (
  code: string,
  data: Partial<AchievementData>,
  unit: WeightUnit = 'lb',
) => {
  const found = achievements(
    { sessions: [], legacyCheckIns: [], milestones: [], goals: [], ...data },
    unit,
  ).find((achievement) => achievement.code === code)
  if (!found) {
    throw new Error(`no achievement ${code}`)
  }
  return found.unlockedAt
}

describe('achievements', () => {
  it('starts with everything locked and unique codes', () => {
    const all = achievements(
      { sessions: [], legacyCheckIns: [], milestones: [], goals: [] },
      'lb',
    )
    expect(all.every((achievement) => achievement.unlockedAt === null)).toBe(
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
    expect(unlockedAt('visits-1', { sessions })).toEqual(new Date(2026, 0, 1))
    expect(unlockedAt('visits-10', { sessions })).toBeNull()
    expect(unlockedAt('visits-10', { sessions, legacyCheckIns })).toEqual(
      new Date(2026, 0, 12),
    )
  })

  it('ignores sessions still in progress', () => {
    const sessions = [session(at(0, 1), { kind: 'workout', status: 'active' })]
    expect(unlockedAt('visits-1', { sessions })).toBeNull()
  })

  it('unlocks a streak on the first visit of its last week', () => {
    const sessions = [
      session(at(0, 5)),
      session(at(0, 14)),
      session(at(0, 13)),
      session(at(0, 21)),
      session(at(0, 28)),
    ]
    expect(unlockedAt('streak-4', { sessions })).toEqual(new Date(2026, 0, 28))
  })

  it('restarts a streak after a week off', () => {
    const sessions = [at(0, 5), at(0, 12), at(0, 26), at(1, 2), at(1, 9)].map(
      (time) => session(time),
    )
    expect(unlockedAt('streak-4', { sessions })).toBeNull()
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
    expect(unlockedAt('hours-100', { sessions })).toEqual(new Date(at(0, 6, 1)))
    expect(
      unlockedAt('hours-100', { sessions: sessions.slice(0, 5) }),
    ).toBeNull()
  })

  it('unlocks a club when the best singles add up', () => {
    const milestones = [
      lift('Squat', 400, 1, at(0, 1)),
      lift('Bench Press', 250, 1, at(0, 2)),
      lift('Deadlift', 340, 1, at(0, 3)),
      lift('Deadlift', 350, 1, at(0, 4)),
    ]
    expect(unlockedAt('club-1000', { milestones })).toEqual(new Date(at(0, 4)))
    expect(unlockedAt('club-1200', { milestones })).toBeNull()
  })

  it('needs singles on all three lifts for a club', () => {
    const milestones = [
      lift('Squat', 500, 1, at(0, 1)),
      lift('Deadlift', 600, 1, at(0, 2)),
      lift('Bench Press', 300, 3, at(0, 3)),
    ]
    expect(unlockedAt('club-1000', { milestones })).toBeNull()
  })

  it('counts lifts logged in kilograms', () => {
    const milestones = [
      lift('Squat', 405, 1, at(0, 1), 'kg'),
      lift('Bench Press', 275, 1, at(0, 1), 'kg'),
      lift('Deadlift', 520, 1, at(0, 1), 'kg'),
    ]
    expect(unlockedAt('club-1200', { milestones })).not.toBeNull()
    expect(unlockedAt('squat-405', { milestones })).not.toBeNull()
  })

  it('unlocks lift badges for any reps and matches names in any case', () => {
    const milestones = [lift('bench press', 225, 5, at(0, 3))]
    expect(unlockedAt('bench-225', { milestones })).toEqual(new Date(at(0, 3)))
    expect(unlockedAt('bench-135', { milestones })).toEqual(new Date(at(0, 3)))
    expect(unlockedAt('bench-275', { milestones })).toBeNull()
    expect(unlockedAt('squat-225', { milestones })).toBeNull()
  })

  it('unlocks on the first lift that reaches the weight', () => {
    const milestones = [
      lift('Deadlift', 500, 1, at(0, 9)),
      lift('Deadlift', 405, 3, at(0, 2)),
    ]
    expect(unlockedAt('deadlift-405', { milestones })).toEqual(
      new Date(at(0, 2)),
    )
  })

  it('shows weights in the chosen unit', () => {
    const all = achievements(
      { sessions: [], legacyCheckIns: [], milestones: [], goals: [] },
      'kg',
    )
    const club = all.find((achievement) => achievement.code === 'club-1000')
    expect(club?.title).toBe('1,000 lb club')
    expect(club?.description).toContain('453.6 kg')
  })

  it('counts milestones and goals', () => {
    const milestones = Array.from({ length: 10 }, (_, i) =>
      lift('Squat', 100 + i, 5, at(1, i + 1)),
    )
    const goals = [
      goal({ id: 'a', createdAt: at(0, 3), completedAt: at(1, 5) }),
      goal({ id: 'b', createdAt: at(0, 2) }),
    ]
    expect(unlockedAt('milestones-10', { milestones })).toEqual(
      new Date(at(1, 10)),
    )
    expect(unlockedAt('milestones-50', { milestones })).toBeNull()
    expect(unlockedAt('goal-set', { goals })).toEqual(new Date(at(0, 2)))
    expect(unlockedAt('goals-done-1', { goals })).toEqual(new Date(at(1, 5)))
    expect(unlockedAt('goals-done-10', { goals })).toBeNull()
  })

  it('unlocks the ladder badge when every goal on an exercise is done', () => {
    const goals = [
      goal({ id: 'a', targetWeightKg: 100, completedAt: at(1, 5) }),
      goal({ id: 'b', targetWeightKg: 120, completedAt: at(2, 5) }),
      goal({ id: 'c', exerciseId: 'squat', completedAt: at(0, 5) }),
    ]
    expect(unlockedAt('ladder-done', { goals })).toEqual(new Date(at(2, 5)))
  })

  it('keeps the ladder badge locked while a goal is open', () => {
    const goals = [
      goal({ id: 'a', completedAt: at(1, 5) }),
      goal({ id: 'b', targetWeightKg: 120 }),
    ]
    expect(unlockedAt('ladder-done', { goals })).toBeNull()
  })
})

describe('achievementSections', () => {
  const badge = (
    code: string,
    group: Achievement['group'],
    series: string,
  ): Achievement => ({
    code,
    group,
    series,
    title: code,
    description: '',
    unlockedAt: null,
  })
  const codes = (sections: ReturnType<typeof achievementSections>) =>
    sections.map((section) => ({
      group: section.group,
      series: section.series.map((run) => run.map((a) => a.code)),
    }))

  it('splits each group into runs of the same series', () => {
    const all = [
      badge('v1', 'Showing up', 'visits'),
      badge('v10', 'Showing up', 'visits'),
      badge('s4', 'Showing up', 'streak'),
      badge('c1000', 'Strength', 'club'),
    ]
    expect(codes(achievementSections(all))).toEqual([
      { group: 'Showing up', series: [['v1', 'v10'], ['s4']] },
      { group: 'Strength', series: [['c1000']] },
    ])
  })

  it('returns nothing for no achievements', () => {
    expect(achievementSections([])).toEqual([])
  })

  it('gives every built-in series its own run', () => {
    const sections = achievementSections(
      achievements(
        { sessions: [], legacyCheckIns: [], milestones: [], goals: [] },
        'lb',
      ),
    )
    const series = sections.flatMap((section) =>
      section.series.map((run) => run[0].series),
    )
    expect(new Set(series).size).toBe(series.length)
  })
})
