import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const publicDir = join(import.meta.dirname, '../../public')
const manifest = JSON.parse(
  readFileSync(join(publicDir, 'manifest.webmanifest'), 'utf8'),
) as {
  start_url: string
  display: string
  icons: { src: string; sizes: string }[]
}

describe('web app manifest', () => {
  it('opens full screen from the app root', () => {
    expect(manifest.display).toBe('standalone')
    expect(manifest.start_url).toBe('/')
  })

  it('has the 192px and 512px icons installs need', () => {
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(
      expect.arrayContaining(['192x192', '512x512']),
    )
  })

  it('points every icon at a file that exists', () => {
    for (const icon of manifest.icons) {
      expect(existsSync(join(publicDir, icon.src))).toBe(true)
    }
  })
})
