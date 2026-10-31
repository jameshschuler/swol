import { useRouter } from '@tanstack/react-router'
import { RotateCw } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'

export function PageLoadError() {
  const router = useRouter()

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <p className="font-heading">Couldn't load this page</p>
        <p className="text-sm">Check your connection and try again.</p>
        <Button variant="neutral" onClick={() => void router.invalidate()}>
          <RotateCw />
          Retry
        </Button>
      </CardContent>
    </Card>
  )
}
