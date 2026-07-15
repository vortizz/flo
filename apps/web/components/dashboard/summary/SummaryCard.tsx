import {
  TrendingUp,
  TrendingDown,
  ArrowDownToLine,
  PiggyBank,
  ArrowUpToLine,
} from 'lucide-react'

interface SummaryCardProps {
  label: string
  amount: number
  previousAmount: number
  change: number
  type: 'income' | 'expenses' | 'savings'
}

const BEFORE_GRADIENT = {
  income: 'before:bg-[linear-gradient(90deg,#00C896,rgba(0,200,150,0.1))]',
  expenses: 'before:bg-[linear-gradient(90deg,#ef4444,rgba(239,68,68,0.1))]',
  savings: 'before:bg-[linear-gradient(90deg,#3b82f6,rgba(59,130,246,0.1))]',
}

const GRADIENT = {
  income:
    'bg-[radial-gradient(circle_at_top_left,rgba(0,200,150,0.07)_0%,transparent_60%)]',
  expenses:
    'bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.07)_0%,transparent_60%)]',
  savings:
    'bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.07)_0%,transparent_60%)]',
}

const ICON = {
  income: (
    <div className="flex items-center justify-center size-8 border border-[#00c89633] bg-[#00c8961f] rounded-lg">
      <ArrowDownToLine size={16} className="text-[#00C896]" />
    </div>
  ),
  expenses: (
    <div className="flex items-center justify-center size-8 border border-[#f8717133] bg-[#f871711a] rounded-lg">
      <ArrowUpToLine size={16} className="text-[#f87171]" />
    </div>
  ),
  savings: (
    <div className="flex items-center justify-center size-8 border border-[#60a5fa33] bg-[#60a5fa1a] rounded-lg">
      <PiggyBank size={16} className="text-[#60a5fa]" />
    </div>
  ),
}

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export default function SummaryCard({
  label,
  amount,
  previousAmount,
  change,
  type,
}: SummaryCardProps) {
  const isPositive = type === 'expenses' ? change <= 0 : change >= 0
  const ChangeIcon = change >= 0 ? TrendingUp : TrendingDown

  return (
    <div
      className={`relative overflow-hidden bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-2 before:content-[''] before:absolute before:inset-0 before:h-0.5 before:rounded-t ${BEFORE_GRADIENT[type]}`}
    >
      <div
        className={`${GRADIENT[type]} absolute inset-0 opacity-50 pointer-events-none`}
      />
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {ICON[type]}
          <span className="text-sm text-[#8b949e] font-medium">{label}</span>
        </div>
        <span
          className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            isPositive
              ? 'text-[#00C896] bg-[#00c8961a] border border-[#00c89633]'
              : 'text-[#f87171] bg-[#f871711a] border border-[#f8717133]'
          }`}
        >
          <ChangeIcon size={12} />
          {Math.abs(change)}%
        </span>
      </div>

      <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
        {formatAUD(amount)}
        <span className="text-sm text-[#8b949e] font-normal ml-1.5">AUD</span>
      </span>

      <span className="text-xs text-[#8b949e]">
        vs {formatAUD(previousAmount)} last period
      </span>
    </div>
  )
}
