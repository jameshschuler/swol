import { Flex, Skeleton } from '@mantine/core'

export function CheckInSkeleton() {
  return (
    <Flex direction="column" gap={16}>
      <Skeleton height={50} radius="md" />
      <Skeleton height={50} radius="md" />
      <Skeleton height={50} radius="md" />
      <Skeleton height={100} radius="md" />
    </Flex>
  )
}
