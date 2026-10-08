import { Link } from '@tanstack/react-router'
import type { NavItem } from './nav-items'

export function SidebarLink({ to, label, icon: Icon }: NavItem) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-base border-2 border-transparent px-3 py-2 font-heading hover:border-border"
      activeProps={{
        className: 'bg-main text-main-foreground border-border! shadow-shadow',
      }}
    >
      <Icon className="size-5" />
      {label}
    </Link>
  )
}
