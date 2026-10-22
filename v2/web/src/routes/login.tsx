import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthForm } from '#/components/auth/AuthForm'
import { redirectIfSignedIn, supabase } from '#/lib/supabase'

export const Route = createFileRoute('/login')({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  component: Login,
})

function Login() {
  const navigate = useNavigate()

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) {
      return error.message
    }
    await navigate({ to: '/dashboard' })
    return null
  }

  return <AuthForm mode="login" onSubmit={signIn} />
}
