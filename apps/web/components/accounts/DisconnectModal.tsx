'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

interface DisconnectModalProps {
  accountName: string
  bankName: string
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}

export default function DisconnectModal({
  accountName,
  bankName,
  onConfirm,
  onCancel,
  isLoading,
}: DisconnectModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-6 w-full max-w-md mx-4 flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Disconnect {accountName}?
            </h2>
          </div>
          <p className="text-sm text-[#8b949e] leading-relaxed">
            This will remove{' '}
            <span className="text-white font-medium">
              {bankName} · {accountName}
            </span>{' '}
            and all its transaction history from Flo. This action cannot be
            undone.
          </p>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg border border-[#1a2d3d] text-sm text-[#8b949e] hover:text-white hover:border-[#2a3d4d] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
