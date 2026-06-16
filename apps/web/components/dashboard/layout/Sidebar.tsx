'use client'

import SidebarLogo from './SidebarLogo'
import SidebarNav from './SidebarNav'
import SidebarUser from './SidebarUser'

export default function Sidebar({
  collapsed,
  mobileOpen,
  onClose,
  onAddTransaction,
}: {
  collapsed: boolean
  mobileOpen: boolean
  onClose: () => void
  onAddTransaction?: () => void
}) {
  return (
    <aside
      className={[
        'fixed lg:relative flex flex-col h-screen',
        'bg-[#020617]/95 border-r border-white/5 backdrop-blur-xl',
        'z-40 transition-all duration-300 overflow-hidden',
        // Desktop: width toggles between icon-only (w-16) and full (w-64)
        // Mobile: always full width (w-64), visibility controlled by translate
        'w-64',
        collapsed ? 'lg:w-16' : 'lg:w-64',
        mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      <div className={`p-6 space-y-10 ${collapsed ? 'lg:px-3' : ''}`}>
        <SidebarLogo collapsed={collapsed} />
        <SidebarNav
          collapsed={collapsed}
          onClose={onClose}
          onAddTransaction={onAddTransaction}
        />
      </div>
      <div className={`mt-auto p-6 ${collapsed ? 'lg:px-3' : ''}`}>
        <SidebarUser collapsed={collapsed} onClose={onClose} />
      </div>
    </aside>
  )
}
