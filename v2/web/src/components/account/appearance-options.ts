import { Monitor, Moon, Sun } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ColorTheme, ThemePreference } from '#/lib/theme'

export const modeOptions: {
  value: ThemePreference
  label: string
  icon: LucideIcon
}[] = [
  { value: 'system', label: 'System', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

export const colorLabels: Record<ColorTheme, string> = {
  green: 'Green',
  blue: 'Blue',
  orange: 'Orange',
  pink: 'Pink',
  purple: 'Purple',
  yellow: 'Yellow',
}
