import { useState } from 'react'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { visitYears, yearStats } from '#/lib/stats'
import { StatTile } from './StatTile'

export function YearStats({ days, now }: { days: Set<string>; now: Date }) {
  const [year, setYear] = useState(now.getFullYear())
  const years = visitYears(days, now)
  const stats = yearStats(days, year, now)

  return (
    <Card>
      <CardHeader>
        <CardTitle>By year</CardTitle>
        <CardAction>
          <Select
            value={String(year)}
            onValueChange={(value) => {
              if (value) {
                setYear(Number(value))
              }
            }}
          >
            <SelectTrigger
              aria-label="Year"
              className="w-28 bg-secondary-background text-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <StatTile label="Visits" value={String(stats.visits)} />
        <StatTile
          label="Visits per week"
          value={stats.visitsPerWeek.toFixed(1)}
        />
      </CardContent>
    </Card>
  )
}
