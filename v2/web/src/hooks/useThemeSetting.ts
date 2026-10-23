import { useState } from 'react'
import { applyStoredTheme } from '#/lib/theme'

export function useThemeSetting<T extends string>(
  key: string,
  parse: (value: string | null) => T,
) {
  const [value, setValue] = useState(() => {
    try {
      return parse(localStorage.getItem(key))
    } catch {
      return parse(null)
    }
  })

  const update = (next: T) => {
    try {
      localStorage.setItem(key, next)
    } catch {
      return
    }
    setValue(next)
    applyStoredTheme()
  }

  return [value, update] as const
}
