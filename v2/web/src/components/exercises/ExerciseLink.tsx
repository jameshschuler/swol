import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from '#/lib/utils'

export function ExerciseLink({
  exerciseId,
  className,
  children,
}: {
  exerciseId: string
  className?: string
  children: ReactNode
}) {
  return (
    <Link
      to="/exercises/$exerciseId"
      params={{ exerciseId }}
      className={cn(
        'rounded-base underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none',
        className,
      )}
    >
      {children}
    </Link>
  )
}
