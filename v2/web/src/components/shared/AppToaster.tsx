import type { ReactNode } from 'react'
import { Toast } from '@base-ui/react/toast'
import { toast } from '#/components/ui/toast'
import { ToastList } from './ToastList'

export function AppToaster({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider toastManager={toast}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed top-[calc(4.5rem+env(safe-area-inset-top))] md:top-4 right-4 z-50 flex w-[min(20rem,calc(100vw-2rem))] flex-col gap-2 outline-none">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}
