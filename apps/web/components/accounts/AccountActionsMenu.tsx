'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Unlink } from 'lucide-react'

interface AccountActionsMenuProps {
  onDisconnect: () => void
}

export default function AccountActionsMenu({
  onDisconnect,
}: AccountActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-8 h-8 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#1a2d3d] transition-colors"
      >
        <MoreVertical size={14} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl shadow-xl w-48 overflow-hidden">
          <button
            onClick={() => {
              onDisconnect()
              setOpen(false)
            }}
            className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 transition-colors text-left"
          >
            <Unlink size={14} />
            Disconnect account
          </button>
        </div>
      )}
    </div>
  )
}
