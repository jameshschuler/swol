import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '#/components/shared/ComingSoon'

export const Route = createFileRoute('/_app/achievements')({
  component: () => (
    <ComingSoon
      page="Achievements"
      description="Badges for showing up and putting in work."
    />
  ),
})
