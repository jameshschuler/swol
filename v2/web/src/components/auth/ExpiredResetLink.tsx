import { Link } from '@tanstack/react-router'
import { CardContent } from '#/components/ui/card'
import { AuthCard } from './AuthCard'

export function ExpiredResetLink() {
  return (
    <AuthCard subtitle="Reset link expired">
      <CardContent className="flex flex-col gap-4">
        <p>This reset link is invalid or has expired.</p>
        <Link to="/forgot-password" className="font-heading underline">
          Send a new link
        </Link>
      </CardContent>
    </AuthCard>
  )
}
