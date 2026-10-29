import { Toast } from '@base-ui/react/toast'
import { CircleCheck } from 'lucide-react'
import { ToastClose, ToastDescription, ToastTitle } from '#/components/ui/toast'

export function ToastList() {
  const { toasts } = Toast.useToastManager()

  return toasts.map((item) => (
    <Toast.Root
      key={item.id}
      toast={item}
      swipeDirection="right"
      className="flex items-start gap-3 rounded-base border-2 border-border bg-background p-3 text-foreground shadow-shadow transition-[transform,opacity] duration-300 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring data-ending-style:translate-x-[120%] data-ending-style:opacity-0 data-limited:hidden data-starting-style:translate-x-[120%] data-starting-style:opacity-0 data-swiping:transition-none [transform:translateX(var(--toast-swipe-movement-x))]"
    >
      {item.type === 'success' && (
        <CircleCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <ToastTitle />
        <ToastDescription />
      </div>
      <ToastClose />
    </Toast.Root>
  ))
}
