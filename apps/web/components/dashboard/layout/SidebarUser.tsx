'use client'

import { useUser } from '@clerk/nextjs'
import { ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function SidebarUser({
  collapsed,
  onClose,
}: {
  collapsed: boolean
  onClose: () => void
}) {
  const { user } = useUser()
  const router = useRouter()
  const name = user?.fullName ?? user?.firstName ?? 'User'
  // const email = user?.emailAddresses[0]?.emailAddress ?? ''
  const avatar = user?.imageUrl

  function handleClick() {
    onClose()
    router.push('/settings')
  }

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
      className="group flex items-center gap-2 p-3 rounded-xl bg-[#ffffff08] cursor-pointer border border-[#1a2d3d] hover:bg-[#ffffff12] hover:border-[#2a3d4d] transition-all duration-200"
      onClick={handleClick}
    >
      {avatarEl}
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium text-white truncate">{name}</p>
      </div>
      <ChevronRightIcon
        size={16}
        className="text-[#8b949e] group-hover:text-white group-hover:translate-x-0.5 transition-all duration-200"
      />
    </div>
  )
}
