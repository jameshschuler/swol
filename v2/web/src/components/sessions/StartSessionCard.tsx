import { Play } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { useStartSession } from '#/hooks/useSessionMutations'
import { CheckInForm } from './CheckInForm'

export function StartSessionCard() {
  const startSession = useStartSession()

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-6 text-center">
        <p className="font-heading text-xl">Ready to lift?</p>
        <Button
          size="lg"
          disabled={startSession.isPending}
          onClick={() => startSession.mutate()}
        >
          <Play />
          Start session
        </Button>
        {startSession.error && (
          <p className="text-danger">{startSession.error.message}</p>
        )}
        <p className="text-sm">or just log that you went</p>
        <CheckInForm />
      </CardContent>
    </Card>
  )
}
