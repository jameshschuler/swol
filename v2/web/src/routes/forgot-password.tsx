import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordForm } from '#/components/auth/ForgotPasswordForm'
import { redirectIfSignedIn, sendPasswordReset } from '#/lib/supabase'

export const Route = createFileRoute('/forgot-password')({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  component: ForgotPassword,
})

function ForgotPassword() {
  return <ForgotPasswordForm onSubmit={sendPasswordReset} />
}
