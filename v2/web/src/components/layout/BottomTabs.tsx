import { Link } from '@tanstack/react-router'
import { navItems } from './nav-items'

export function BottomTabs() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t-2 border-border bg-secondary-background pb-[env(safe-area-inset-bottom)] md:hidden">
      {navItems.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          aria-label={label}
          className="flex flex-col items-center gap-1 py-2 text-[10px] font-heading"
          activeProps={{ className: 'bg-main text-main-foreground' }}
        >
          <Icon className="size-5" />
          <span className="truncate">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
