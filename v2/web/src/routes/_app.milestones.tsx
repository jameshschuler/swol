import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '#/components/shared/ComingSoon'

export const Route = createFileRoute('/_app/milestones')({
  component: () => (
    <ComingSoon page="Milestones" description="Your personal records." />
  ),
})
