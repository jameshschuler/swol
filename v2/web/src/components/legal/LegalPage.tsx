import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '#/components/ui/card'
import { LegalLinks } from './LegalLinks'
import { legalLastUpdated } from './legal-constants'

export function LegalPage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-6 p-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1 text-sm">
        <ArrowLeft className="size-4" />
        SWOL
      </Link>
      <header>
        <h1 className="font-heading text-3xl md:text-4xl">{title}</h1>
        <p className="mt-1 text-sm">Last updated {legalLastUpdated}</p>
      </header>
      <Card>
        <CardContent className="flex flex-col gap-6 [&_li]:ml-5 [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-1">
          {children}
        </CardContent>
      </Card>
      <LegalLinks />
    </main>
  )
}
