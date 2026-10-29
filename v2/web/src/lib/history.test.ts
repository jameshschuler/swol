import { describe, expect, it } from 'vitest'
import { buildHistory, groupByMonth } from './history'
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
  createdAt: startedAt,
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

describe('groupByMonth', () => {
  const legacy = (id: number, at: Date) => ({
    type: 'legacy' as const,
    at: at.toISOString(),
    checkIn: { id, checkedInAt: at.toISOString() },
  })

  it('splits newest-first items into months, keeping their order', () => {
    const months = groupByMonth([
      legacy(1, new Date(2026, 9, 13)),
      legacy(2, new Date(2026, 9, 2)),
      legacy(3, new Date(2026, 1, 13)),
      legacy(4, new Date(2025, 11, 31)),
    ])
    expect(
      months.map((m) => [m.year, m.month, m.items.map((i) => i.at)]),
    ).toEqual([
      [
        2026,
        9,
        [
          new Date(2026, 9, 13).toISOString(),
          new Date(2026, 9, 2).toISOString(),
        ],
      ],
      [2026, 1, [new Date(2026, 1, 13).toISOString()]],
      [2025, 11, [new Date(2025, 11, 31).toISOString()]],
    ])
  })

  it('is empty when there is nothing', () => {
    expect(groupByMonth([])).toEqual([])
  })
})
