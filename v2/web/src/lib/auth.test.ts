import { describe, expect, it } from 'vitest'
import { isRecoveryHash, minPasswordLength, newPasswordError } from './auth'

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
