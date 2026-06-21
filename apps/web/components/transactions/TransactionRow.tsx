import { type Transaction } from '@/lib/api/transactions'
import { createElement } from 'react'
import { getCategoryIcon } from '../ui/categoryIcon'

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatTime(dateStr: string, isCash: boolean) {
  if (isCash) return ''
  return new Date(dateStr).toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function MerchantIcon({
  merchant,
  categoryIcon,
  categoryColor,
  dimmed,
}: {
  merchant: string
  categoryIcon: string | null
  categoryColor: string | null
  dimmed: boolean
}) {
  const Icon = getCategoryIcon(categoryIcon)

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity ${dimmed ? 'opacity-40' : ''}`}
      style={{
        backgroundColor:
          Icon && categoryColor ? `${categoryColor}20` : '#1a2d3d',
      }}
    >
      {Icon ? (
        createElement(Icon, {
          size: 14,
          style: { color: categoryColor ?? '#8b949e' },
        })
      ) : (
        <span className="text-xs font-semibold text-[#8b949e]">
          {merchant?.charAt(0).toUpperCase() ?? '?'}
        </span>
      )}
    </div>
  )
}

function CategoryPill({
  category,
  color,
  dimmed,
}: {
  category: string | null
  color: string | null
  dimmed: boolean
}) {
  if (!category) return <span className="text-xs text-[#8b949e]">—</span>
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-[#1e293b] text-[#cbd5e1] border border-white/5 transition-opacity ${dimmed ? 'opacity-40' : ''}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ backgroundColor: color ?? '#8b949e' }}
      />
      {category}
    </span>
  )
}

function ExcludedBadge() {
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
      Excluded
    </span>
  )
}

export default function TransactionRow({
  transaction: tx,
  onClick,
  isSelected,
}: {
  transaction: Transaction
  onClick?: () => void
  isSelected?: boolean
}) {
  const dimmed = tx.isExcluded

  return (
    <>
      {/* Mobile card */}
      <div
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-4 border-b border-[#1a2d3d] transition-colors cursor-pointer md:hidden ${
          isSelected
            ? 'bg-[#00C896]/5 border-l-2 border-l-[#00C896]'
            : 'hover:bg-[#ffffff04]'
        }`}
      >
        <MerchantIcon
          merchant={tx.merchant}
          categoryIcon={tx.categoryIcon}
          categoryColor={tx.categoryColor}
          dimmed={dimmed}
        />
        <div className="flex flex-1 min-w-0 justify-between gap-2 items-center">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium transition-opacity ${dimmed ? 'text-[#8b949e] opacity-40' : 'text-white'}`}
              >
                {tx.merchant}
              </span>
              {tx.isCash && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20">
                  Cash
                </span>
              )}
              {tx.isExcluded && <ExcludedBadge />}
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              {tx.categoryColor && (
                <span
                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-opacity ${dimmed ? 'opacity-40' : ''}`}
                  style={{ backgroundColor: tx.categoryColor }}
                />
              )}
              <span
                className={`text-xs transition-opacity ${dimmed ? 'text-[#8b949e] opacity-40' : 'text-[#8b949e]'}`}
              >
                {tx.category ?? '—'}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span
              className={`text-sm font-semibold transition-opacity ${dimmed ? 'opacity-40' : ''} ${tx.type === 'CREDIT' ? 'text-[#2dd4bf]' : 'text-white'}`}
            >
              {tx.type === 'CREDIT' ? '+' : '-'}
              {formatAUD(tx.amount)}
            </span>
            <span
              className={`text-xs text-[#8b949e] mt-1 transition-opacity ${dimmed ? 'opacity-40' : ''}`}
            >
              {formatTime(tx.date, tx.isCash)}
            </span>
          </div>
        </div>
      </div>

      {/* Desktop row */}
      <div
        onClick={onClick}
        className={`hidden md:grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr] gap-4 px-6 py-4 border-b border-[#1a2d3d] transition-colors cursor-pointer items-center ${
          isSelected
            ? 'bg-[#00C896]/5 border-l-2 border-l-[#00C896]'
            : 'hover:bg-[#ffffff04]'
        }`}
      >
        {/* Date */}
        <div className="flex flex-col gap-1">
          <span
            className={`text-xs text-[#8b949e] transition-opacity ${dimmed ? 'opacity-40' : ''}`}
          >
            {formatTime(tx.date, tx.isCash)}
          </span>
        </div>

        {/* Merchant */}
        <div className="flex items-center gap-3 min-w-0">
          <MerchantIcon
            merchant={tx.merchant}
            categoryIcon={tx.categoryIcon}
            categoryColor={tx.categoryColor}
            dimmed={dimmed}
          />
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`text-sm font-medium text-wrap transition-opacity ${dimmed ? 'text-[#8b949e] opacity-40' : 'text-white'}`}
            >
              {tx.merchant}
            </span>
            {tx.isExcluded && <ExcludedBadge />}
          </div>
        </div>

        {/* Category */}
        <div>
          <CategoryPill
            category={tx.category}
            color={tx.categoryColor}
            dimmed={dimmed}
          />
        </div>

        {/* Account */}
        <div>
          <span
            className={`text-xs text-[#cbd5e1] truncate transition-opacity ${dimmed ? 'opacity-40' : ''}`}
          >
            {tx.account}
          </span>
        </div>

        {/* Amount */}
        <div className="text-right">
          <span
            className={`text-sm font-semibold transition-opacity ${dimmed ? 'opacity-40' : ''} ${tx.type === 'CREDIT' ? 'text-[#2dd4bf]' : 'text-white'}`}
          >
            {tx.type === 'CREDIT' ? '+' : '-'}
            {formatAUD(tx.amount)}
          </span>
        </div>
      </div>
    </>
  )
}
