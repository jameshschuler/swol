import { Box } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/ComingSoon'
import { useAuth } from '@/hooks/useAuth'

export const Route = createFileRoute('/_auth/dashboard')({
  component: DashboardPage,
})

function DashboardPage() {
  const auth = useAuth()

  return (
    <Box>
      <p>
        Hi {auth.user?.email}!
      </p>
      <ComingSoon page="Dashboard" />
    </Box>
  )
}
