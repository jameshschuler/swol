import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyTheme, parseThemePreference } from './theme'

describe('parseThemePreference', () => {
  it.each([
    ['light', 'light'],
    ['dark', 'dark'],
    ['system', 'system'],
    [null, 'system'],
    ['purple', 'system'],
  ])('reads %s as %s', (value, expected) => {
    expect(parseThemePreference(value)).toBe(expected)
  })
})

describe('applyTheme', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function run(stored: string | null, systemDark: boolean) {
    const toggle = vi.fn()
    vi.stubGlobal('localStorage', { getItem: () => stored })
    vi.stubGlobal('matchMedia', () => ({ matches: systemDark }))
    vi.stubGlobal('document', { documentElement: { classList: { toggle } } })
    applyTheme('key')
    return toggle.mock.calls[0]
  }

  it.each([
    ['dark', false, true],
    ['light', true, false],
    ['system', true, true],
    ['system', false, false],
    [null, true, true],
  ])('stored %s with system dark %s → dark %s', (stored, systemDark, dark) => {
    expect(run(stored, systemDark)).toEqual(['dark', dark])
  })

  it('follows the system when storage is blocked', () => {
    const toggle = vi.fn()
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked')
      },
    })
    vi.stubGlobal('matchMedia', () => ({ matches: true }))
    vi.stubGlobal('document', { documentElement: { classList: { toggle } } })
    applyTheme('key')
    expect(toggle).toHaveBeenCalledWith('dark', true)
  })
})
