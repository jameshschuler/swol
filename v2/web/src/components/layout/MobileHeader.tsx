import { Link } from '@tanstack/react-router'
import { utilityItems } from './nav-items'

export function MobileHeader() {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b-2 border-border bg-secondary-background px-4 pt-[env(safe-area-inset-top)] md:hidden">
      <p className="py-3 text-2xl font-heading">SWOL</p>
      <div className="flex gap-3">
        {utilityItems.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            aria-label={label}
            title={label}
            className="flex size-10 items-center justify-center rounded-base border-2 border-border bg-background shadow-shadow"
            activeProps={{ className: 'bg-main text-main-foreground' }}
          >
            <Icon className="size-5" />
          </Link>
        ))}
      </div>
    </header>
  )
}
