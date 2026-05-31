'use client'

import { useUser } from '@clerk/nextjs'

export default function DashboardPage() {
  const { user } = useUser()

  return (
    <div className="flex items-center justify-center h-full min-h-[60vh]">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          Welcome, {user?.firstName || 'there'} 👋
        </h2>
        <p className="text-[#8b949e] text-sm">Dashboard coming soon.</p>
      </div>
    </div>
  )
}
