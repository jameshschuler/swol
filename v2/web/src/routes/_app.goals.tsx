import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '#/components/ComingSoon'

export const Route = createFileRoute('/_app/goals')({
  component: () => (
    <ComingSoon page="Goals" description="Lifts you're working toward." />
  ),
})
