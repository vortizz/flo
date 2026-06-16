import { type Transaction } from '@/lib/api/transactions'

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatTime(dateStr: string, isManual: boolean) {
  if (isManual) return ''
  return new Date(dateStr).toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function MerchantIcon({ merchant }: { merchant: string }) {
  return (
    <div className="w-8 h-8 rounded-full bg-[#1a2d3d] flex items-center justify-center flex-shrink-0">
      <span className="text-xs font-semibold text-[#8b949e]">
        {merchant?.charAt(0).toUpperCase() ?? '?'}
      </span>
    </div>
  )
}

function CategoryPill({ category }: { category: string | null }) {
  if (!category) return <span className="text-xs text-[#8b949e]">—</span>
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs bg-[#1e293b] text-[#cbd5e1] border border-white/5">
      {category}
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
        <MerchantIcon merchant={tx.merchant} />
        <div className="flex flex-1 min-w-0 justify-between gap-2 items-center">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-white font-medium">
                {tx.merchant}
              </span>
              {tx.isManual && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-[#00C896]/10 text-[#00C896] border border-[#00C896]/20">
                  Cash
                </span>
              )}
            </div>
            <div className="mt-1 text-xs text-[#8b949e]">{tx.category}</div>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span
              className={`text-sm font-semibold ${tx.type === 'CREDIT' ? 'text-[#2dd4bf]' : 'text-white'}`}
            >
              {tx.type === 'CREDIT' ? '+' : '-'}
              {formatAUD(tx.amount)}
            </span>
            <span className="text-xs text-[#8b949e] mt-1">
              {formatTime(tx.date, tx.isManual)}
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
          <span className="text-xs text-[#8b949e]">
            {formatTime(tx.date, tx.isManual)}
          </span>
        </div>

        {/* Merchant */}
        <div className="flex items-center gap-3 min-w-0">
          <MerchantIcon merchant={tx.merchant} />
          <span className="text-sm text-white font-medium text-wrap">
            {tx.merchant}
          </span>
        </div>

        {/* Category */}
        <div>
          <CategoryPill category={tx.category} />
        </div>

        {/* Account */}
        <div>
          <span className="text-xs text-[#cbd5e1] truncate">{tx.account}</span>
        </div>

        {/* Amount */}
        <div className="text-right">
          <span
            className={`text-sm font-semibold ${tx.type === 'CREDIT' ? 'text-[#2dd4bf]' : 'text-white'}`}
          >
            {tx.type === 'CREDIT' ? '+' : '-'}
            {formatAUD(tx.amount)}
          </span>
        </div>
      </div>
    </>
  )
}
