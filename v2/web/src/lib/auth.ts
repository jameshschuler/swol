export const minPasswordLength = 8

export function oauthErrorFrom(search: string, hash: string): string | null {
  for (const part of [search, hash]) {
    const params = new URLSearchParams(part.replace(/^[?#]/, ''))
    const error = params.get('error_description') ?? params.get('error')
    if (error) {
      return error
    }
  }
  return null
}

export function isRecoveryHash(hash: string): boolean {
  return new URLSearchParams(hash.replace(/^#/, '')).get('type') === 'recovery'
}

export function newPasswordError(
  password: string,
  confirmation: string,
): string | null {
  if (password.length < minPasswordLength) {
    return `Password must be at least ${minPasswordLength} characters.`
  }
  if (password !== confirmation) {
    return "Passwords don't match."
  }
  return null
}
