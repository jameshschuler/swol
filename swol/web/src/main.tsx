import { MantineProvider } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, ErrorComponent, RouterProvider } from '@tanstack/react-router'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import { AuthProvider } from './AuthProvider.tsx'
import { NotFound } from './components/NotFound.tsx'
import { useAuth } from './hooks/index.ts'
import { routeTree } from './routeTree.gen'
import { theme } from './theme.ts'
import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'

dayjs.extend(utc)
dayjs.extend(customParseFormat)

const queryClient = new QueryClient()

const router = createRouter({
  routeTree,
  defaultPendingComponent: () => (
    // TODO:
    <div>
      {/* <Spinner /> */}
      Loading...
    </div>
  ),
  defaultNotFoundComponent: NotFound,
  defaultErrorComponent: ({ error }) => <ErrorComponent error={error} />,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  context: {
    auth: undefined!,
  },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

if ('serviceWorker' in navigator) {
  registerSW()
}

function InnerApp() {
  const auth = useAuth()
  return (
    <RouterProvider router={router} context={{ auth }}></RouterProvider>
  )
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Notifications position="top-center" />
        <InnerApp />
      </QueryClientProvider>
    </AuthProvider>
  )
}

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </StrictMode>,
)
