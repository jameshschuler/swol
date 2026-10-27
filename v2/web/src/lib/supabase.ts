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

export async function signInWithEmail(
  email: string,
  password: string,
): Promise<string | null> {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return error ? error.message : null
}

export async function signUpWithEmail(
  email: string,
  password: string,
): Promise<{ error: string | null; signedIn: boolean }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${window.location.origin}/dashboard` },
  })
  return {
    error: error ? error.message : null,
    signedIn: Boolean(data.session),
  }
}

export async function sendPasswordReset(email: string): Promise<string | null> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  return error ? error.message : null
}

export async function updatePassword(password: string): Promise<string | null> {
  const { error } = await supabase.auth.updateUser({ password })
  return error ? error.message : null
}

export async function signOut(): Promise<string | null> {
  const { error } = await supabase.auth.signOut()
  return error ? error.message : null
}
