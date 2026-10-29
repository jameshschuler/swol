import { describe, expect, it } from 'vitest'
import { formatTime } from './format'
import { elapsedSeconds, sessionTimes } from './sessions'
import type { WorkoutSession } from '#/types/api'

const start = Date.parse('2026-10-12T10:00:00Z')
const at = (seconds: number) => new Date(start + seconds * 1000).toISOString()

const session = (overrides: Partial<WorkoutSession>): WorkoutSession => ({
  id: 's1',
  kind: 'workout',
  status: 'active',
  startedAt: at(0),
  pausedAt: null,
  pausedSeconds: 0,
  endedAt: null,
  notes: null,
  createdAt: '2026-10-01T12:00:00Z',
  ...overrides,
})

describe('elapsedSeconds', () => {
  it('counts up to now for an active session', () => {
    expect(elapsedSeconds(session({}), start + 90_000)).toBe(90)
  })

  it('subtracts time already spent paused', () => {
    expect(elapsedSeconds(session({ pausedSeconds: 30 }), start + 90_000)).toBe(
      60,
    )
  })

  it('stops at the pause time while paused', () => {
    const paused = session({
      status: 'paused',
      pausedAt: at(45),
      pausedSeconds: 5,
    })
    expect(elapsedSeconds(paused, start + 600_000)).toBe(40)
  })

  it('stops at the end time once completed', () => {
    const done = session({
      status: 'completed',
      endedAt: at(3600),
      pausedSeconds: 600,
    })
    expect(elapsedSeconds(done, start + 99_999_000)).toBe(3000)
  })

  it('never goes negative when the clock is behind the server', () => {
    expect(elapsedSeconds(session({}), start - 5000)).toBe(0)
  })
})

describe('sessionTimes', () => {
  it('shows the time of a check-in made that day', () => {
    const checkIn = session({
      kind: 'check_in',
      status: 'completed',
      startedAt: at(0),
      endedAt: at(0),
      createdAt: at(0),
    })
    expect(sessionTimes(checkIn)).toBe(`Checked in at ${formatTime(at(0))}`)
  })

  it('shows the time when saved a few seconds later, even across midnight', () => {
    const lateNight = session({
      kind: 'check_in',
      status: 'completed',
      startedAt: at(86400 - 5),
      endedAt: at(86400 - 5),
      createdAt: at(86400 + 5),
    })
    expect(sessionTimes(lateNight)).toBe(
      `Checked in at ${formatTime(at(86400 - 5))}`,
    )
  })

  it('has no time for a backdated check-in', () => {
    const backdated = session({
      kind: 'check_in',
      status: 'completed',
      startedAt: at(0),
      endedAt: at(0),
      createdAt: at(3 * 86400),
    })
    expect(sessionTimes(backdated)).toBeUndefined()
  })

  it('shows the start and end of a finished workout', () => {
    const done = session({ status: 'completed', endedAt: at(3600) })
    expect(sessionTimes(done)).toBe(
      `${formatTime(at(0))} – ${formatTime(at(3600))}`,
    )
  })

  it('shows only the start of an open workout', () => {
    expect(sessionTimes(session({}))).toBe(`Started at ${formatTime(at(0))}`)
  })
})
