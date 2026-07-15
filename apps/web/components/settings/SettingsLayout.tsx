'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { User, Tag, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { label: 'Profile', href: '/settings/profile', icon: User },
  { label: 'My Categories', href: '/settings/categories', icon: Tag },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <>
      {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className={[
              'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full',
              active
                ? 'bg-[#1e293b] text-white border border-[#1a2d3d]'
                : 'text-[#8b949e] hover:text-white hover:bg-[#ffffff08]',
            ].join(' ')}
          >
            <Icon size={15} />
            {label}
          </Link>
        )
      })}

      <div className="mt-2 pt-2 border-t border-[#1a2d3d]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all text-left"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </>
  )
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const activeLabel =
    NAV_ITEMS.find(i => i.href === pathname)?.label ?? 'Settings'

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-full">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl px-4 py-3">
        <span className="text-sm font-medium text-white">{activeLabel}</span>
        <button
          onClick={() => setMobileMenuOpen(v => !v)}
          className="text-[#8b949e] hover:text-white transition-colors"
        >
          {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-2 flex flex-col gap-1">
          <NavContent onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block w-52 shrink-0">
        <div className="sticky top-0 flex flex-col gap-1">
          <NavContent />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">{children}</div>
    </div>
  )
}
