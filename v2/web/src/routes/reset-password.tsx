import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ExpiredResetLink } from '#/components/auth/ExpiredResetLink'
import { ResetPasswordForm } from '#/components/auth/ResetPasswordForm'
import {
  getSession,
  openedFromRecoveryLink,
  updatePassword,
} from '#/lib/supabase'

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

  async function saveNewPassword(password: string) {
    const error = await updatePassword(password)
    if (!error) {
      await navigate({ to: '/dashboard' })
    }
    return error
  }

  return canReset ? (
    <ResetPasswordForm onSubmit={saveNewPassword} />
  ) : (
    <ExpiredResetLink />
  )
}
