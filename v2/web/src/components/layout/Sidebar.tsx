import { SidebarLink } from './SidebarLink'
import { accountItem, navItems } from './nav-items'

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-2 border-r-2 border-border bg-secondary-background p-4 md:flex">
      <p className="mb-4 px-3 text-3xl font-heading">SWOL</p>
      {navItems.map((item) => (
        <SidebarLink key={item.to} {...item} />
      ))}
      <div className="mt-auto">
        <SidebarLink {...accountItem} />
      </div>
    </aside>
  )
}
