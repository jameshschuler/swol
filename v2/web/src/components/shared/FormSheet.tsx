import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '#/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '#/components/ui/drawer'
import { useIsMobile } from '#/hooks/useIsMobile'

export function FormSheet({
  title,
  trigger,
  children,
}: {
  title: string
  trigger: ReactElement
  children: (close: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()
  const close = () => setOpen(false)

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger render={trigger} />
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{title}</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            {children(close)}
          </div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children(close)}
      </DialogContent>
    </Dialog>
  )
}
