import { describe, expect, it } from 'vitest'
import {
  isRecoveryHash,
  minPasswordLength,
  newPasswordError,
  oauthErrorFrom,
} from './auth'

describe('newPasswordError', () => {
  const valid = 'a'.repeat(minPasswordLength)

  it('accepts a long enough password that matches', () => {
    expect(newPasswordError(valid, valid)).toBeNull()
  })

  it('rejects a short password', () => {
    const short = 'a'.repeat(minPasswordLength - 1)
    expect(newPasswordError(short, short)).toMatch(/at least/)
  })

  it('rejects a confirmation that does not match', () => {
    expect(newPasswordError(valid, `${valid}x`)).toMatch(/match/)
  })
})

describe('isRecoveryHash', () => {
  it('spots a password recovery link', () => {
    expect(
      isRecoveryHash('#access_token=abc&refresh_token=def&type=recovery'),
    ).toBe(true)
  })

  it.each([
    ['', 'no hash'],
    ['#access_token=abc&type=signup', 'a signup link'],
    ['#type=recoveryx', 'a lookalike value'],
  ])('ignores %s (%s)', (hash) => {
    expect(isRecoveryHash(hash)).toBe(false)
  })
})

describe('oauthErrorFrom', () => {
  it('reads the error description from the query string', () => {
    expect(
      oauthErrorFrom(
        '?error=access_denied&error_description=User+cancelled+login',
        '',
      ),
    ).toBe('User cancelled login')
  })

  it('reads the error description from the hash', () => {
    expect(
      oauthErrorFrom(
        '',
        '#error=server_error&error_description=Provider%20off',
      ),
    ).toBe('Provider off')
  })

  it('falls back to the error code', () => {
    expect(oauthErrorFrom('?error=access_denied', '')).toBe('access_denied')
  })

  it('is null without an error', () => {
    expect(oauthErrorFrom('?next=/dashboard', '#access_token=abc')).toBeNull()
  })
})
