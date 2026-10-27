import { useState } from 'react'
import type { FormEvent } from 'react'
import { Button } from '#/components/ui/button'
import { CardContent, CardFooter } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { newPasswordError } from '#/lib/auth'
import { useAuthAction } from '#/hooks/useAuthAction'
import { AuthCard } from './AuthCard'
import { FormError } from './FormError'

export function ResetPasswordForm({
  onSubmit,
}: {
  onSubmit: (password: string) => Promise<string | null>
}) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const { error, setError, pending, run } = useAuthAction()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const invalid = newPasswordError(password, confirmation)
    if (invalid) {
      setError(invalid)
      return
    }
    await run(() => onSubmit(password))
  }

  return (
    <AuthCard subtitle="Choose a new password">
      <form onSubmit={handleSubmit}>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="confirmation">Confirm new password</Label>
            <Input
              id="confirmation"
              type="password"
              autoComplete="new-password"
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>
          <FormError message={error} />
        </CardContent>
        <CardFooter className="mt-6">
          <Button type="submit" className="w-full" disabled={pending}>
            Update password
          </Button>
        </CardFooter>
      </form>
    </AuthCard>
  )
}
