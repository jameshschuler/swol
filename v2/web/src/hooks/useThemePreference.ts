import { useState } from 'react'
import { applyTheme, parseThemePreference, themeStorageKey } from '#/lib/theme'
import type { ThemePreference } from '#/lib/theme'

function readPreference(): ThemePreference {
  try {
    return parseThemePreference(localStorage.getItem(themeStorageKey))
  } catch {
    return 'system'
  }
}

export function useThemePreference() {
  const [preference, setPreference] = useState(readPreference)

  const update = (next: ThemePreference) => {
    try {
      localStorage.setItem(themeStorageKey, next)
    } catch {
      return
    }
    setPreference(next)
    applyTheme(themeStorageKey)
  }

  return [preference, update] as const
}
