import {
  Dumbbell,
  Flag,
  History,
  House,
  Medal,
  Trophy,
  UserRound,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to:
    | '/dashboard'
    | '/sessions'
    | '/milestones'
    | '/goals'
    | '/exercises'
    | '/achievements'
    | '/account'
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: House },
  { to: '/sessions', label: 'Sessions', icon: History },
  { to: '/milestones', label: 'Milestones', icon: Trophy },
  { to: '/goals', label: 'Goals', icon: Flag },
]

export const utilityItems: NavItem[] = [
  { to: '/exercises', label: 'Exercises', icon: Dumbbell },
  { to: '/achievements', label: 'Achievements', icon: Medal },
  { to: '/account', label: 'Account', icon: UserRound },
]
