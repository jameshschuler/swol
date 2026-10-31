import type { ReactNode } from 'react'

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl">{title}</h2>
      {children}
    </section>
  )
}
