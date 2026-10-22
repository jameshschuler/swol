import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-heading md:text-4xl">{title}</h1>
        {description && <p className="mt-1">{description}</p>}
      </div>
      {action}
    </header>
  )
}
