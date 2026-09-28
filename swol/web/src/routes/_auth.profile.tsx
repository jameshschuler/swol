import { Flex } from '@mantine/core'
import { createFileRoute } from '@tanstack/react-router'
import { ComingSoon } from '@/components/ComingSoon'

export const Route = createFileRoute('/_auth/profile')({
  component: ProfilePage,
})

function ProfilePage() {
  return (
    <Flex direction="column" align="center">
      <ComingSoon page="Profile" />
    </Flex>
  )
}
