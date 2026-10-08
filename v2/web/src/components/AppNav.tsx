import { Link } from '@tanstack/react-router'
import { Flag, History, House, Medal, Trophy, UserRound } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface NavItem {
  to:
    | '/dashboard'
    | '/sessions'
    | '/milestones'
    | '/goals'
    | '/achievements'
    | '/account'
  label: string
  icon: LucideIcon
}

const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: House },
  { to: '/sessions', label: 'Sessions', icon: History },
  { to: '/milestones', label: 'Milestones', icon: Trophy },
  { to: '/goals', label: 'Goals', icon: Flag },
  { to: '/achievements', label: 'Achievements', icon: Medal },
  { to: '/account', label: 'Account', icon: UserRound },
]

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
