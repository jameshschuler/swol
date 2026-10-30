import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { CardAction } from '#/components/ui/card'

export function DashboardCardLink({
  to,
  label,
}: {
  to: '/goals' | '/milestones'
  label: string
}) {
  return (
    <CardAction>
      <Link to={to} className="inline-flex items-center gap-1 text-sm">
        {label}
        <ArrowRight className="size-4" />
      </Link>
    </CardAction>
  )
}
