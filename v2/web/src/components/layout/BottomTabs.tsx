import { Link } from '@tanstack/react-router'
import { navItems } from './nav-items'

export function BottomTabs() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 bg-background px-4 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] md:hidden">
      <nav className="grid grid-cols-4 gap-1 rounded-base border-2 border-border bg-secondary-background p-1.5 shadow-shadow">
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
    </div>
  )
}
