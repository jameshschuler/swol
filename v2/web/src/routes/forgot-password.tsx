import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordForm } from '#/components/auth/ForgotPasswordForm'
import { redirectIfSignedIn, supabase } from '#/lib/supabase'

export const Route = createFileRoute('/forgot-password')({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  component: ForgotPassword,
})

function ForgotPassword() {
  async function sendResetLink(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return error ? error.message : null
  }

  return <ForgotPasswordForm onSubmit={sendResetLink} />
}
