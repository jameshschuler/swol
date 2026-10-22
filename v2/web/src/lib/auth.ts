export const minPasswordLength = 8

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
