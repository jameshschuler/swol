import { createFileRoute } from '@tanstack/react-router'
import { TermsAndConditions } from '#/components/legal/TermsAndConditions'

export const Route = createFileRoute('/terms-conditions')({
  head: () => ({ meta: [{ title: 'Terms & Conditions · Swol' }] }),
  component: TermsAndConditions,
})
