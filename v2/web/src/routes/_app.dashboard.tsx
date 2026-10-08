import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '#/components/ComingSoon'

export const Route = createFileRoute('/_app/dashboard')({
  component: () => (
    <ComingSoon page="Dashboard" description="Your training at a glance." />
  ),
})
