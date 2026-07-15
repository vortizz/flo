import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ConfirmDialogProps {
  name: string
  onConfirm: () => void
  onClose: () => void
}

export default function ConfirmDialog({
  name,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleConfirm() {
    setIsDeleting(true)
    try {
      await onConfirm()
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => {
        if (!isDeleting && e.target === e.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-sm bg-[#0d1f2d] border border-[#1a2d3d] rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Trash2 size={18} className="text-red-400" />
            </div>
            <h2 className="text-base font-semibold text-white">
              Delete Category
            </h2>
          </div>
          <p className="text-sm text-[#8b949e]">
            Are you sure you want to delete{' '}
            <span className="text-white font-medium">{name}</span>? This action
            cannot be undone.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-[#1a2d3d] text-sm font-medium text-[#8b949e] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
