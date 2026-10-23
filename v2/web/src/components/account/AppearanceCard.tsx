import { Check } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { useThemeSetting } from '#/hooks/useThemeSetting'
import {
  colorStorageKey,
  colorThemes,
  parseColorTheme,
  parseThemePreference,
  themeStorageKey,
} from '#/lib/theme'
import { colorLabels, modeOptions } from './appearance-options'

export function AppearanceCard() {
  const [mode, setMode] = useThemeSetting(themeStorageKey, parseThemePreference)
  const [color, setColor] = useThemeSetting(colorStorageKey, parseColorTheme)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="text-sm font-heading">Mode</p>
          <div className="flex flex-wrap gap-3">
            {modeOptions.map(({ value, label, icon: Icon }) => (
              <Button
                key={value}
                variant={mode === value ? 'default' : 'neutral'}
                onClick={() => setMode(value)}
                aria-pressed={mode === value}
              >
                <Icon />
                {label}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-heading">Color</p>
          <div className="flex flex-wrap gap-3">
            {colorThemes.map((value) => (
              <Button
                key={value}
                variant="neutral"
                onClick={() => setColor(value)}
                aria-pressed={color === value}
              >
                <span
                  data-color={value}
                  className="flex size-5 items-center justify-center rounded-full border-2 border-border bg-main text-main-foreground"
                >
                  {color === value && <Check className="size-3!" />}
                </span>
                {colorLabels[value]}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
