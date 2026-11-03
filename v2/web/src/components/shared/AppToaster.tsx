import type { ReactNode } from 'react'
import { Toast } from '@base-ui/react/toast'
import { toast } from '#/components/ui/toast'
import { ToastList } from './ToastList'

export function AppToaster({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider toastManager={toast} timeout={2000}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed inset-x-0 bottom-[calc(6rem+env(safe-area-inset-bottom))] z-50 mx-auto flex w-[min(18rem,calc(100vw-2rem))] flex-col gap-2 outline-none md:right-4 md:bottom-4 md:left-auto md:mx-0 md:w-80">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}
