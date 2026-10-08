import { Link } from '@tanstack/react-router'
import { navItems } from './nav-items'

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-2 border-r-2 border-border bg-secondary-background p-4 md:flex">
      <p className="mb-4 px-3 text-3xl font-heading">SWOL</p>
      {navItems.map(({ to, label, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          className="flex items-center gap-3 rounded-base border-2 border-transparent px-3 py-2 font-heading hover:border-border"
          activeProps={{
            className:
              'bg-main text-main-foreground border-border! shadow-shadow',
          }}
        >
          <Icon className="size-5" />
          {label}
        </Link>
      ))}
    </aside>
  )
}
