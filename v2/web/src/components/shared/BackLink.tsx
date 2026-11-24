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
    <Link to={to} className="mb-4 inline-flex items-center gap-1 text-sm">
      <ArrowLeft className="size-4" />
      {label}
    </Link>
  )
}
