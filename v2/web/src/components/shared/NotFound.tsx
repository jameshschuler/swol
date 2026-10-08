import { Link } from '@tanstack/react-router'
import { SearchX } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'

export function NotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="flex flex-col items-center gap-4 py-10 text-center">
          <SearchX className="size-12" />
          <h1 className="text-3xl font-heading">Page not found</h1>
          <p>That page doesn't exist or has moved.</p>
          <Button render={<Link to="/" />}>Go home</Button>
        </CardContent>
      </Card>
    </main>
  )
}
