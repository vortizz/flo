'use client'

import { useUser } from '@clerk/nextjs'
import { ChevronRightIcon } from 'lucide-react'
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
  const email = user?.emailAddresses[0]?.emailAddress ?? ''
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
      className="flex items-center gap-2 p-3 rounded-xl bg-[#ffffff08] cursor-pointer border border-[#1a2d3d]"
      onClick={onClose}
    >
      {avatarEl}
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium text-white truncate">{name}</p>
        {/* <p className="text-[10px] text-[#8b949e] truncate">{email}</p> */}
      </div>
      <ChevronRightIcon size={16} className="text-[#8b949e]" />
    </div>
  )
}
