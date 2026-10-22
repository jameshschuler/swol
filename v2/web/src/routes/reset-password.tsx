import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ExpiredResetLink } from '#/components/auth/ExpiredResetLink'
import { ResetPasswordForm } from '#/components/auth/ResetPasswordForm'
import { getSession, openedFromRecoveryLink, supabase } from '#/lib/supabase'

export const Route = createFileRoute('/reset-password')({
  ssr: false,
  loader: async () => ({
    canReset: openedFromRecoveryLink && Boolean(await getSession()),
  }),
  component: ResetPassword,
})

function ResetPassword() {
  const { canReset } = Route.useLoaderData()
  const navigate = useNavigate()

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      return error.message
    }
    await navigate({ to: '/dashboard' })
    return null
  }

  return canReset ? (
    <ResetPasswordForm onSubmit={updatePassword} />
  ) : (
    <ExpiredResetLink />
  )
}
