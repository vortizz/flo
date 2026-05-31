'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListFilter, Building2, Settings } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Main Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/transactions', icon: ListFilter },
  { label: 'Accounts', href: '/accounts', icon: Building2 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export default function SidebarNav({
  collapsed,
  onClose,
}: {
  collapsed: boolean
  onClose: () => void
}) {
  const pathname = usePathname()

  return (
    <nav className="space-y-2">
      {NAV_LINKS.map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            title={collapsed ? label : undefined}
            className={[
              'flex items-center gap-3 rounded-xl transition-colors',
              collapsed
                ? 'lg:justify-center lg:px-0 lg:py-3 px-4 py-3'
                : 'px-4 py-3',
              active ? 'bg-[#00C896]/10' : 'hover:bg-white/5',
            ].join(' ')}
          >
            <Icon
              size={20}
              className={
                active ? 'text-[#00C896] shrink-0' : 'text-[#8b949e] shrink-0'
              }
            />
            {!collapsed && (
              <span
                className={`text-base font-medium whitespace-nowrap ${active ? 'text-[#e6edf3]' : 'text-[#8b949e]'}`}
              >
                {label}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
