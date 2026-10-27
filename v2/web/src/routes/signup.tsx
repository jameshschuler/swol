import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { AuthForm } from '#/components/auth/AuthForm'
import { redirectIfSignedIn, signUpWithEmail } from '#/lib/supabase'

export const Route = createFileRoute('/signup')({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string | null>(null)

  async function signUp(email: string, password: string) {
    setNotice(null)
    const { error, signedIn } = await signUpWithEmail(email, password)
    if (error) {
      return error
    }
    if (signedIn) {
      await navigate({ to: '/dashboard' })
    } else {
      setNotice('Check your email to confirm your account.')
    }
    return null
  }

  return <AuthForm mode="signup" onSubmit={signUp} notice={notice} />
}
