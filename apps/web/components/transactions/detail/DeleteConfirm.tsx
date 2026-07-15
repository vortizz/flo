'use client'

import { useState } from 'react'
import { X, Trash2, Loader2 } from 'lucide-react'

export default function DeleteConfirm({
  onConfirm,
  onCancel,
  onClose,
}: {
  onConfirm: () => Promise<void>
  onCancel: () => void
  onClose: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    setIsDeleting(true)
    try {
      await onConfirm()
    } catch {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
        <h2 className="text-lg font-semibold text-white">Delete Transaction</h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-2">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-2">
          <Trash2 size={24} className="text-red-400" />
        </div>
        <p className="text-white font-semibold text-base">Are you sure?</p>
        <p className="text-sm text-[#8b949e] text-center">
          This transaction will be permanently deleted and cannot be recovered.
        </p>
      </div>

      <div className="px-6 py-5 border-t border-[#1a2d3d] shrink-0">
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-[#1a2d3d] text-[#8b949e] hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Trash2 size={14} />
            )}
            Delete
          </button>
        </div>
      </div>
    </>
  )
}
