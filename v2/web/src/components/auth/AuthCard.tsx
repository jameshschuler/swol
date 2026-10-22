import type { ReactNode } from 'react'
import { Card, CardHeader, CardTitle } from '#/components/ui/card'

export function AuthCard({
  subtitle,
  children,
}: {
  subtitle: string
  children: ReactNode
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-3xl">SWOL</CardTitle>
          <p>{subtitle}</p>
        </CardHeader>
        {children}
      </Card>
    </main>
  )
}
