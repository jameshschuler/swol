import { useQuery } from '@tanstack/react-query'
import { Card, CardContent } from '#/components/ui/card'
import { currentSessionQuery } from '#/lib/queries'
import { ActiveSessionCard } from './ActiveSessionCard'
import { StartSessionCard } from './StartSessionCard'

export function CurrentSession() {
  const { data: session, isPending, error } = useQuery(currentSessionQuery)

  if (isPending || error) {
    return (
      <Card>
        <CardContent>
          {error ? (
            <p className="text-danger">{error.message}</p>
          ) : (
            <p>Loading…</p>
          )}
        </CardContent>
      </Card>
    )
  }
  return session ? (
    <ActiveSessionCard session={session} />
  ) : (
    <StartSessionCard />
  )
}
