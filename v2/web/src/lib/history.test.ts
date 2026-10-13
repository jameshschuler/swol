import { describe, expect, it } from 'vitest'
import { buildHistory } from './history'
import type { WorkoutSession } from '#/types/api'

const session = (
  id: string,
  startedAt: string,
  status: WorkoutSession['status'] = 'completed',
): WorkoutSession => ({
  id,
  kind: 'workout',
  status,
  startedAt,
  pausedAt: null,
  pausedSeconds: 0,
  endedAt: status === 'completed' ? startedAt : null,
  notes: null,
})

describe('buildHistory', () => {
  it('merges sessions and legacy check-ins newest first', () => {
    const history = buildHistory(
      [
        session('a', '2026-10-01T10:00:00Z'),
        session('b', '2026-08-01T10:00:00Z'),
      ],
      [{ id: 1, checkedInAt: '2026-09-01T07:00:00Z' }],
    )
    expect(history.map((item) => item.at)).toEqual([
      '2026-10-01T10:00:00Z',
      '2026-09-01T07:00:00Z',
      '2026-08-01T10:00:00Z',
    ])
    expect(history[1].type).toBe('legacy')
  })

  it('leaves out sessions that are still open', () => {
    const history = buildHistory(
      [session('open', '2026-10-01T10:00:00Z', 'active')],
      [],
    )
    expect(history).toEqual([])
  })

  it('is empty when there is nothing', () => {
    expect(buildHistory([], [])).toEqual([])
  })
})
