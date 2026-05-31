'use client'

import { useUser } from '@clerk/nextjs'
import Image from 'next/image'

export default function SidebarUser({
  collapsed,
  onClose,
}: {
  collapsed: boolean
  onClose: () => void
}) {
  const { user } = useUser()
  const name = user?.fullName ?? user?.firstName ?? 'User'
  const avatar = user?.imageUrl

  const avatarEl = (
    <div className="w-9 h-9 rounded-full bg-[#1a2d3d] flex items-center justify-center overflow-hidden shrink-0">
      {avatar ? (
        <Image
          src={avatar}
          alt={name}
          width={40}
          height={40}
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-sm font-semibold text-[#00C896] uppercase">
          {name[0]}
        </span>
      )}
    </div>
  )

  if (collapsed) {
    return (
      <div
        className="hidden lg:flex justify-center cursor-pointer"
        title={name}
        onClick={onClose}
      >
        {avatarEl}
      </div>
    )
  }

  return (
    <div
      className="bg-linear-to-br from-[rgba(30,41,59,0.7)] to-[rgba(15,23,42,0.4)] backdrop-blur-md border border-white/5 shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)] rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:border-[#00C896]/40 transition-colors"
      onClick={onClose}
    >
      {avatarEl}
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium text-white truncate">{name}</p>
        <p className="text-xs text-[#8b949e]">Free Plan</p>
      </div>
    </div>
  )
}
