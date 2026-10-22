import { createClient } from '@supabase/supabase-js'
import { redirect } from '@tanstack/react-router'
import { isRecoveryHash } from './auth'

export const openedFromRecoveryLink =
  typeof window !== 'undefined' && isRecoveryHash(window.location.hash)

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
)

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}

export async function redirectIfSignedIn() {
  if (await getSession()) {
    throw redirect({ to: '/dashboard' })
  }
}
