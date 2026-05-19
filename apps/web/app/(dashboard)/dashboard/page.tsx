'use client'

import { useClerk, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { FloLogo } from '@/components/logo'

export default function DashboardPage() {
  const { signOut } = useClerk()
  const { user } = useUser()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 40% 40%, #091c29 0%, #04090f 80%)',
      }}
    >
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <FloLogo size={36} />
          <span className="text-white font-semibold text-xl">Flo</span>
        </div>
        <button
          onClick={handleSignOut}
          className="text-sm text-[#8b949e] hover:text-white transition-colors border border-[#1a2d3d] hover:border-[#2a3d4d] px-4 py-2 rounded-xl"
        >
          Sign out
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome, {user?.firstName || 'there'} 👋
          </h1>
          <p className="text-[#8b949e] text-sm">Dashboard coming soon.</p>
        </div>
      </div>
    </div>
  )
}
