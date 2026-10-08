import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '#/components/shared/ComingSoon'

export const Route = createFileRoute('/_app/sessions')({
  component: () => (
    <ComingSoon page="Sessions" description="Every session you've logged." />
  ),
})
