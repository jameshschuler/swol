import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, List } from 'lucide-react'
import { Button } from '#/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '#/components/ui/card'
import { buildHistory } from '#/lib/history'
import { legacyCheckInsQuery, sessionsQuery } from '#/lib/queries'
import { HistoryCalendar } from './HistoryCalendar'
import { HistoryList } from './HistoryList'

type View = 'list' | 'calendar'

const views = [
  { value: 'list', label: 'List', icon: List },
  { value: 'calendar', label: 'Calendar', icon: CalendarDays },
] as const

export function SessionHistory() {
  const [view, setView] = useState<View>('calendar')
  const sessions = useQuery(sessionsQuery)
  const legacyCheckIns = useQuery(legacyCheckInsQuery)
  const error = sessions.error ?? legacyCheckIns.error
  const history =
    sessions.data && legacyCheckIns.data
      ? buildHistory(sessions.data, legacyCheckIns.data)
      : undefined

  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
        <CardAction className="flex gap-2">
          {views.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              size="icon-sm"
              variant={view === value ? 'default' : 'neutral'}
              aria-label={label}
              aria-pressed={view === value}
              onClick={() => setView(value)}
            >
              <Icon />
            </Button>
          ))}
        </CardAction>
      </CardHeader>
      <CardContent>
        {!history && !error && <p>Loading…</p>}
        {error && <p className="text-danger">{error.message}</p>}
        {history && view === 'calendar' && <HistoryCalendar items={history} />}
        {history?.length === 0 && view === 'list' && (
          <p>No finished sessions yet.</p>
        )}
        {history && view === 'list' && <HistoryList items={history} />}
      </CardContent>
    </Card>
  )
}
