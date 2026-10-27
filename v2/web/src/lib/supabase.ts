import { createClient } from '@supabase/supabase-js'
import { redirect } from '@tanstack/react-router'
import { isRecoveryHash, oauthErrorFrom } from './auth'

export const openedFromRecoveryLink =
  typeof window !== 'undefined' && isRecoveryHash(window.location.hash)

export const oauthRedirectError =
  typeof window === 'undefined'
    ? null
    : oauthErrorFrom(window.location.search, window.location.hash)

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

export async function signInWithGoogle(): Promise<string | null> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/login` },
  })
  return error ? error.message : null
}
