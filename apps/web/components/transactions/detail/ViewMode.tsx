import Image from 'next/image'
import { X, Trash2, Pencil, EyeOff, Eye, Loader2, Check } from 'lucide-react'
import { createElement, useState } from 'react'
import { type Transaction } from '@/lib/api/transactions'
import { formatAUD, formatDate } from './utils'
import { getCategoryIcon } from '@/components/ui/categoryIcon'
import CashAvatar from '@/components/ui/CashAvatar'

function MerchantAvatar({
  merchant,
  categoryIcon,
  categoryColor,
}: {
  merchant: string
  categoryIcon: string | null
  categoryColor: string | null
}) {
  const Icon = getCategoryIcon(categoryIcon)

  return (
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
      style={{
        backgroundColor:
          Icon && categoryColor ? `${categoryColor}20` : '#1a2d3d',
      }}
    >
      {Icon ? (
        createElement(Icon, {
          size: 28,
          style: { color: categoryColor ?? '#8b949e' },
        })
      ) : (
        <span className="text-2xl font-bold text-[#8b949e]">
          {merchant?.charAt(0).toUpperCase() ?? '?'}
        </span>
      )}
    </div>
  )
}

export default function ViewMode({
  tx,
  onEdit,
  onDelete,
  onClose,
  onExcludeToggle,
}: {
  tx: Transaction
  onEdit: () => void
  onDelete: () => void
  onClose: () => void
  onExcludeToggle: (isExcluded: boolean) => Promise<void>
}) {
  const [pendingExcluded, setPendingExcluded] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isDirty = pendingExcluded !== null
  const displayExcluded =
    pendingExcluded !== null ? pendingExcluded : tx.isExcluded

  function handleToggle() {
    const next = !displayExcluded
    setPendingExcluded(next === tx.isExcluded ? null : next)
    setSaved(false)
  }

  function handleCancel() {
    setPendingExcluded(null)
    setSaved(false)
  }

  async function handleConfirm() {
    if (pendingExcluded === null) return
    setIsSaving(true)
    try {
      await onExcludeToggle(pendingExcluded)
      setSaved(true)
      setTimeout(() => {
        setSaved(false)
        setPendingExcluded(null)
      }, 1200)
    } catch {
      // revert on error
      setPendingExcluded(null)
    } finally {
      setIsSaving(false)
    }
  }

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
          <MerchantAvatar
            merchant={tx.merchant}
            categoryIcon={tx.categoryIcon}
            categoryColor={tx.categoryColor}
          />
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
              {formatDate(tx.date, tx.isCash)}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Category */}
          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Category
            </div>
            <div className="w-full p-3 rounded-xl border border-white/5 bg-[#1e293b4d] flex gap-3 items-center text-sm text-white">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: tx.categoryColor ?? '#8b949e' }}
              />
              {tx.category ?? '—'}
            </div>
          </div>

          {/* Account */}
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
              ) : tx.isCash ? (
                <CashAvatar size="lg" />
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

          {/* Note */}
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

          {/* Exclude from budget */}
          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Budget
            </div>
            <button
              onClick={handleToggle}
              className={`w-full p-3 rounded-xl border flex items-center justify-between text-sm transition-colors ${
                displayExcluded
                  ? 'border-amber-500/20 bg-amber-500/5'
                  : 'border-white/5 bg-[#1e293b4d]'
              }`}
            >
              <div className="flex items-center gap-3">
                {displayExcluded ? (
                  <EyeOff size={15} className="text-amber-400 shrink-0" />
                ) : (
                  <Eye size={15} className="text-[#8b949e] shrink-0" />
                )}
                <span
                  className={displayExcluded ? 'text-amber-400' : 'text-white'}
                >
                  {displayExcluded
                    ? 'Excluded from budget'
                    : 'Included in budget'}
                </span>
              </div>
              {/* Toggle pill */}
              <div
                className={`w-9 h-5 rounded-full transition-colors relative shrink-0 ${
                  displayExcluded ? 'bg-amber-500/30' : 'bg-[#1a2d3d]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                    displayExcluded
                      ? 'left-4.5 bg-amber-400'
                      : 'left-0.5 bg-[#8b949e]'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar — confirm/cancel or edit/delete */}
      {isDirty ? (
        <div className="px-6 py-5 border-t border-[#1a2d3d] shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 py-3 rounded-xl border border-[#1a2d3d] text-[#8b949e] hover:text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={isSaving || saved}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                saved
                  ? 'bg-[#00C896]/20 text-[#00C896]'
                  : 'bg-[#00C896] hover:bg-[#00b084] text-black shadow-[0_4px_20px_rgba(0,200,150,0.25)]'
              }`}
            >
              {saved ? (
                <>
                  <Check size={15} strokeWidth={2.5} />
                  Saved!
                </>
              ) : isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Confirm'
              )}
            </button>
          </div>
        </div>
      ) : (
        tx.isCash && (
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
        )
      )}
    </>
  )
}
