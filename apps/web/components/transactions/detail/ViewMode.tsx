import Image from 'next/image'
import { X, Trash2, Pencil, HandCoins } from 'lucide-react'
import { type Transaction } from '@/lib/api/transactions'
import { formatAUD, formatDate } from './utils'

function MerchantAvatar({ merchant }: { merchant: string }) {
  return (
    <div className="w-16 h-16 rounded-2xl bg-[#1a2d3d] flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl font-bold text-[#8b949e]">
        {merchant?.charAt(0).toUpperCase() ?? '?'}
      </span>
    </div>
  )
}

export default function ViewMode({
  tx,
  onEdit,
  onDelete,
  onClose,
}: {
  tx: Transaction
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
}) {
  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
        <h2 className="text-lg font-semibold text-white">
          Transaction Details
        </h2>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1a2d3d]">
        <div className="p-6 pb-4">
          <MerchantAvatar merchant={tx.merchant} />
          <div className="text-center">
            <p className="text-xl font-semibold text-white mb-1">
              {tx.merchant}
            </p>
            <p
              className={`text-3xl font-bold mb-2 ${tx.type === 'CREDIT' ? 'text-[#00C896]' : 'text-white'}`}
            >
              {tx.type === 'CREDIT' ? '+' : '-'}
              {formatAUD(tx.amount)}{' '}
              <span className="text-lg font-normal text-[#64748b]">AUD</span>
            </p>
            <div className="text-sm text-[#8b949e]">
              {formatDate(tx.date, tx.isManual)}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Category
            </div>
            <div className="w-full p-3 rounded-xl border border-white/5 bg-[#1e293b4d] flex gap-3 items-center text-sm text-white">
              <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
              {tx.category ?? '—'}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Account
            </div>
            <div className="w-full p-3 rounded-xl border border-white/5 bg-[#1e293b4d] flex gap-3 items-center text-sm text-white">
              {tx.logoUrl ? (
                <Image
                  src={tx.logoUrl}
                  alt={tx.account}
                  width={32}
                  height={32}
                  className="rounded-full"
                />
              ) : tx.isManual ? (
                <div className="w-8 h-8 rounded-full bg-[#1a2d3d] flex items-center justify-center text-[#00C896]">
                  <HandCoins size={16} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#1a2d3d] flex items-center justify-center">
                  <span className="text-xs font-bold text-[#8b949e]">
                    {tx.account.slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <p className="text-sm text-white">{tx.account}</p>
                {tx.last4 && (
                  <p className="text-[#8b949e] text-xs">••• {tx.last4}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Note
            </div>
            {tx.description ? (
              <div className="w-full p-3 rounded-xl border border-white/5 bg-[#1e293b4d] flex gap-3 items-center text-sm text-white">
                {tx.description}
              </div>
            ) : (
              <div className="w-full p-3 rounded-xl border border-white/5 bg-[#1e293b4d] text-sm text-[#4a6070]">
                —
              </div>
            )}
          </div>
        </div>
      </div>

      {tx.isManual && (
        <div className="px-6 py-5 border-t border-[#1a2d3d] shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onDelete}
              className="flex-1 py-3 rounded-xl border border-[#1a2d3d] text-[#8b949e] hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={14} />
              Delete
            </button>
            <button
              onClick={onEdit}
              className="flex-1 py-3 rounded-xl bg-[#00C896] hover:bg-[#00b084] text-black text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Pencil size={14} />
              Edit
            </button>
          </div>
        </div>
      )}
    </>
  )
}
