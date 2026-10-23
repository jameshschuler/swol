import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  applyTheme,
  colorThemes,
  parseColorTheme,
  parseThemePreference,
} from './theme'

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

describe('parseColorTheme', () => {
  it.each([
    ['blue', 'blue'],
    ['yellow', 'yellow'],
    [null, 'green'],
    ['dark', 'green'],
  ])('reads %s as %s', (value, expected) => {
    expect(parseColorTheme(value)).toBe(expected)
  })
})

describe('applyTheme', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  function run(getItem: (key: string) => string | null, systemDark: boolean) {
    const root = {
      classList: { toggle: vi.fn() },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
    }
    vi.stubGlobal('localStorage', { getItem })
    vi.stubGlobal('matchMedia', () => ({ matches: systemDark }))
    vi.stubGlobal('document', { documentElement: root })
    applyTheme('theme', 'color', colorThemes)
    return root
  }

  const stored =
    (values: Record<string, string>) =>
    (key: string): string | null =>
      values[key] ?? null

  it.each([
    ['dark', false, true],
    ['light', true, false],
    ['system', true, true],
    ['system', false, false],
  ])('stored %s with system dark %s → dark %s', (theme, systemDark, dark) => {
    const root = run(stored({ theme }), systemDark)
    expect(root.classList.toggle).toHaveBeenCalledWith('dark', dark)
  })

  it('follows the system when nothing is stored', () => {
    const root = run(stored({}), true)
    expect(root.classList.toggle).toHaveBeenCalledWith('dark', true)
    expect(root.removeAttribute).toHaveBeenCalledWith('data-color')
  })

  it('sets a known color theme on the page', () => {
    const root = run(stored({ color: 'purple' }), false)
    expect(root.setAttribute).toHaveBeenCalledWith('data-color', 'purple')
  })

  it('ignores an unknown color theme', () => {
    const root = run(stored({ color: 'Blue' }), false)
    expect(root.setAttribute).not.toHaveBeenCalled()
    expect(root.removeAttribute).toHaveBeenCalledWith('data-color')
  })

  it('falls back to the defaults when storage is blocked', () => {
    const root = run(() => {
      throw new Error('blocked')
    }, true)
    expect(root.classList.toggle).toHaveBeenCalledWith('dark', true)
    expect(root.removeAttribute).toHaveBeenCalledWith('data-color')
  })
})
