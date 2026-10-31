import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '#/components/home/HomePage'
import { redirectIfSignedIn } from '#/lib/supabase'

export const Route = createFileRoute('/')({
  ssr: false,
  beforeLoad: redirectIfSignedIn,
  component: HomePage,
})
