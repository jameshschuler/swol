import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { AuthForm } from '#/components/AuthForm'
import { getSession, supabase } from '#/lib/supabase'

export const Route = createFileRoute('/signup')({
  ssr: false,
  beforeLoad: async () => {
    if (await getSession()) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: Signup,
})

function Signup() {
  const navigate = useNavigate()
  const [notice, setNotice] = useState<string | null>(null)

  async function signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) {
      return error.message
    }
    if (data.session) {
      await navigate({ to: '/dashboard' })
    } else {
      setNotice('Check your email to confirm your account.')
    }
    return null
  }

  return <AuthForm mode="signup" onSubmit={signUp} notice={notice} />
}
