import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '#/components/ui/button'
import { CardContent, CardFooter } from '#/components/ui/card'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { minPasswordLength } from '#/lib/auth'
import { AuthCard } from './AuthCard'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onSubmit: (email: string, password: string) => Promise<string | null>
  notice?: string | null
}

export function AuthForm({ mode, onSubmit, notice }: AuthFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const isLogin = mode === 'login'

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      setError(await onSubmit(email, password))
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthCard
      subtitle={isLogin ? 'Sign in to your account' : 'Create your account'}
    >
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
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              minLength={isLogin ? undefined : minPasswordLength}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {isLogin && (
              <Link
                to="/forgot-password"
                className="self-end text-sm underline"
              >
                Forgot password?
              </Link>
            )}
          </div>
          {error && <p className="text-sm font-heading text-danger">{error}</p>}
          {notice && <p className="text-sm font-heading">{notice}</p>}
        </CardContent>
        <CardFooter className="mt-6 flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={pending}>
            {isLogin ? 'Sign in' : 'Sign up'}
          </Button>
          <p className="text-sm">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link
              to={isLogin ? '/signup' : '/login'}
              className="font-heading underline"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>
        </CardFooter>
      </form>
    </AuthCard>
  )
}
