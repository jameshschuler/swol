import { useEffect } from 'react'
import {
  Outlet,
  createFileRoute,
  redirect,
  useRouter,
} from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { BottomTabs } from '#/components/layout/BottomTabs'
import { MobileHeader } from '#/components/layout/MobileHeader'
import { Sidebar } from '#/components/layout/Sidebar'
import { getSession, supabase } from '#/lib/supabase'

export const Route = createFileRoute('/_app')({
  ssr: false,
  beforeLoad: async () => {
    if (!(await getSession())) {
      throw redirect({ to: '/login' })
    }
  },
  component: AppLayout,
})

function AppLayout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        queryClient.clear()
        void router.navigate({ to: '/login' })
      }
    })
    return () => data.subscription.unsubscribe()
  }, [router, queryClient])

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main className="mx-auto w-full max-w-4xl flex-1 p-4 pb-[calc(7rem+env(safe-area-inset-bottom))] md:p-8">
          <Outlet />
        </main>
      </div>
      <BottomTabs />
    </div>
  )
}
