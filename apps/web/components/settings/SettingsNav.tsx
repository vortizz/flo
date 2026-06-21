'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { User, Tag, LogOut } from 'lucide-react'

const NAV_ITEMS = [
  { id: 'profile', label: 'Profile', href: '/settings/profile', icon: User },
  {
    id: 'categories',
    label: 'My Categories',
    href: '/settings/categories',
    icon: Tag,
  },
]

export default function SettingsNav() {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <div className="w-full md:w-52 shrink-0">
      <div className="md:sticky md:top-0 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
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
      </div>
    </div>
  )
}
