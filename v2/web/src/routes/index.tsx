import { createFileRoute, redirect } from '@tanstack/react-router'
import { getSession } from '#/lib/supabase'

export const Route = createFileRoute('/')({
  ssr: false,
  beforeLoad: async () => {
    throw redirect({ to: (await getSession()) ? '/dashboard' : '/login' })
  },
})
