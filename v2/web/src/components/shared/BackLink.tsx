import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

export function BackLink({
  to,
  label,
}: {
  to: '/sessions' | '/exercises'
  label: string
}) {
  return (
    <Link
      to={to}
      className="mb-4 inline-flex items-center gap-1 rounded-base text-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
    >
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  )
}
