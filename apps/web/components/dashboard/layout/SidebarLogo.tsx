import { FloLogo } from '@/components/logo'

export default function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div
      className={`flex items-center gap-3 ${collapsed ? 'lg:justify-center' : ''}`}
    >
      <FloLogo size={32} />
      {!collapsed && (
        <span className="text-xl font-bold tracking-tight text-white">Flo</span>
      )}
    </div>
  )
}
