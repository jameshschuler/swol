import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { CardContent, CardFooter } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { AuthCard } from './AuthCard'

export function ForgotPasswordForm({
  onSubmit,
}: {
  onSubmit: (email: string) => Promise<string | null>
}) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const result = await onSubmit(email)
      setError(result)
      setSent(result === null)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard subtitle="Reset your password">
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setSent(false)
              }}
            />
          </div>
          {error && <p className="text-sm font-heading text-danger">{error}</p>}
          {sent && (
            <p className="text-sm font-heading">
              If an account exists for that email, a reset link is on its way.
              Check your inbox.
            </p>
          )}
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            Send reset link
          </Button>
          <p className="text-sm">
            Remembered it?{' '}
            <Link to="/login" className="font-heading underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </AuthCard>
  )
}
