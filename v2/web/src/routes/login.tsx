import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthForm } from '#/components/auth/AuthForm'
import {
  oauthRedirectError,
  redirectIfSignedIn,
  signInWithEmail,
} from '#/lib/supabase'

export const Route = createFileRoute('/login')({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  component: Login,
})

function Login() {
  const navigate = useNavigate()

  async function signIn(email: string, password: string) {
    const error = await signInWithEmail(email, password)
    if (!error) {
      await navigate({ to: '/dashboard' })
    }
    return error
  }

  return (
    <AuthForm
      mode="login"
      onSubmit={signIn}
      initialError={oauthRedirectError}
    />
  )
}
