import { Link } from '@tanstack/react-router'
import { navItems } from './nav-items'

export function BottomTabs() {
  return (
    <nav className="fixed inset-x-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 grid grid-cols-5 gap-1 rounded-base border-2 border-border bg-secondary-background p-1.5 shadow-shadow md:hidden">
      {navItems.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex min-w-0 flex-col items-center justify-center gap-1 rounded-base border-2 border-transparent px-0.5 py-1.5"
          activeProps={{
            className: 'bg-main text-main-foreground border-border!',
          }}
        >
          <Icon className="size-5" />
          <span className="w-full truncate text-center text-[10px] leading-none font-heading">
            {label}
          </span>
        </Link>
      ))}
    </nav>
  )
}
