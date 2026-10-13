export type ThemePreference = 'system' | 'light' | 'dark'

export const themeStorageKey = 'swol-theme'

export function parseThemePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function applyTheme(storageKey: string) {
  let stored = null
  try {
    stored = localStorage.getItem(storageKey)
  } catch {
    stored = null
  }
  const dark =
    stored === 'dark' ||
    (stored !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.classList.toggle('dark', dark)
}

const apply = `(${applyTheme.toString()})(${JSON.stringify(themeStorageKey)})`

export const themeScript = `${apply};matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){${apply}})`
