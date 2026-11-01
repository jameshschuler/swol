import { useState } from 'react'
import type { FormEvent } from 'react'
import { MapPin } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useCheckIn } from '#/hooks/useSessionMutations'
import { localDateKey, timeForDate } from '#/lib/dates'

export function CheckInForm() {
  const today = localDateKey(new Date())
  const [date, setDate] = useState(today)
  const checkIn = useCheckIn()

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
          disabled={!date || checkIn.isPending}
        >
          <MapPin />
          Check in
        </Button>
      </div>
      {checkIn.error && (
        <p className="mt-2 text-danger">{checkIn.error.message}</p>
      )}
    </form>
  )
}
