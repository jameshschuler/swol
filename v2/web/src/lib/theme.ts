export type ThemePreference = 'system' | 'light' | 'dark'

export const colorThemes = [
  'green',
  'blue',
  'orange',
  'pink',
  'purple',
  'yellow',
] as const

export type ColorTheme = (typeof colorThemes)[number]

export const themeStorageKey = 'swol-theme'
export const colorStorageKey = 'swol-color'

export function parseThemePreference(value: string | null): ThemePreference {
  return value === 'light' || value === 'dark' ? value : 'system'
}

export function parseColorTheme(value: string | null): ColorTheme {
  return colorThemes.find((theme) => theme === value) ?? 'green'
}

export function applyTheme(
  themeKey: string,
  colorKey: string,
  colors: readonly string[],
) {
  const read = (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }
  const theme = read(themeKey)
  const color = read(colorKey)
  const root = document.documentElement
  const dark =
    theme === 'dark' ||
    (theme !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches)
  root.classList.toggle('dark', dark)
  if (color && colors.includes(color)) {
    root.setAttribute('data-color', color)
  } else {
    root.removeAttribute('data-color')
  }
}

export function applyStoredTheme() {
  applyTheme(themeStorageKey, colorStorageKey, colorThemes)
}

const apply = `(${applyTheme.toString()})(${JSON.stringify(themeStorageKey)},${JSON.stringify(colorStorageKey)},${JSON.stringify(colorThemes)})`

export const themeScript = `${apply};matchMedia('(prefers-color-scheme: dark)').addEventListener('change',function(){${apply}});addEventListener('storage',function(){${apply}})`
