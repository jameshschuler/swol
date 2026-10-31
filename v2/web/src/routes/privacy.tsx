import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPolicy } from '#/components/legal/PrivacyPolicy'

export const Route = createFileRoute('/privacy')({
  head: () => ({ meta: [{ title: 'Privacy Policy · Swol' }] }),
  component: PrivacyPolicy,
})
