import { useState } from 'react'
import type { FormEvent } from 'react'
import { Check, MapPin } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { useClearSuccess } from '#/hooks/useClearSuccess'
import { useCheckIn } from '#/hooks/useSessionMutations'
import { localDateKey, timeForDate } from '#/lib/dates'
import { formatDate } from '#/lib/format'

export function CheckInForm() {
  const today = localDateKey(new Date())
  const [date, setDate] = useState(today)
  const checkIn = useCheckIn()
  useClearSuccess(checkIn, 3000)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    checkIn.mutate(timeForDate(date, new Date()))
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-center">
      <div className="flex gap-2">
        <Input
          type="date"
          value={date}
          max={today}
          onChange={(event) => {
            setDate(event.target.value)
            checkIn.reset()
          }}
          aria-label="Check-in date"
          className="w-auto"
        />
        <Button
          type="submit"
          variant="neutral"
          disabled={!date || checkIn.isPending}
        >
          <MapPin />
          Check in
        </Button>
      </div>
      <p
        role="status"
        className="flex items-center gap-1 font-heading [&:not(:empty)]:mt-2"
      >
        {checkIn.data && (
          <>
            <Check className="size-4" />
            Checked in for {formatDate(checkIn.data.startedAt)}
          </>
        )}
      </p>
      {checkIn.error && (
        <p className="mt-2 text-danger">{checkIn.error.message}</p>
      )}
    </form>
  )
}
