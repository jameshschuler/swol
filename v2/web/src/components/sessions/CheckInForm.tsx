import { useState } from 'react'
import type { FormEvent } from 'react'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Check, MapPin } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useCheckIn } from '#/hooks/useSessionMutations'
import { localDateKey, timeForDate } from '#/lib/dates'
import { legacyCheckInsQuery, sessionsQuery } from '#/lib/queries'
import { hasVisitOn } from '#/lib/stats'

export function CheckInForm() {
  const today = localDateKey(new Date())
  const [date, setDate] = useState(today)
  const { data: sessions } = useSuspenseQuery(sessionsQuery)
  const { data: legacyCheckIns } = useSuspenseQuery(legacyCheckInsQuery)
  const checkIn = useCheckIn()
  const alreadyWent = hasVisitOn(date, sessions, legacyCheckIns)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    checkIn.mutate(timeForDate(date, new Date()))
  }

  return (
    <form onSubmit={submit} className="flex w-full flex-col items-center">
      <div className="grid w-full max-w-xs grid-cols-2 gap-2">
        <Input
          type="date"
          value={date}
          max={today}
          onChange={(event) => {
            setDate(event.target.value)
            checkIn.reset()
          }}
          aria-label="Check-in date"
          className="h-10 min-w-0 appearance-none"
        />
        <Button
          type="submit"
          variant="neutral"
          className="w-full"
          disabled={!date || alreadyWent || checkIn.isPending}
        >
          {alreadyWent ? <Check /> : <MapPin />}
          {alreadyWent ? 'Already logged' : 'Check in'}
        </Button>
      </div>
      {checkIn.error && (
        <p className="mt-2 text-danger">{checkIn.error.message}</p>
      )}
    </form>
  )
}
