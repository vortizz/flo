'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, X } from 'lucide-react'

interface ToastProps {
  message: string
  type: 'success' | 'error'
  onClose: () => void
}

export function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return createPortal(
    <div className="fixed bottom-6 right-6 z-200 flex items-center gap-3 bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl px-4 py-3 shadow-xl">
      {type === 'success' ? (
        <CheckCircle size={16} className="text-[#00C896] shrink-0" />
      ) : (
        <XCircle size={16} className="text-red-400 shrink-0" />
      )}
      <span className="text-sm text-white">{message}</span>
      <button
        onClick={onClose}
        className="text-[#8b949e] hover:text-white transition-colors ml-1"
      >
        <X size={14} />
      </button>
    </div>,
    document.body,
  )
}
