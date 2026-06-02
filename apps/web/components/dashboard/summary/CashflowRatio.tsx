import { ChartNoAxesColumn } from 'lucide-react'

interface CashflowRatioProps {
  income: number
  expenses: number
  savings: number
}

export default function CashflowRatio({
  income,
  expenses,
  savings,
}: CashflowRatioProps) {
  if (income === 0) return null

  const expensesPercent = Math.min(Math.round((expenses / income) * 100), 100)
  const savingsPercent = Math.round((savings / income) * 100)
  const incomePercent = 100 - expensesPercent

  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex items-center justify-center gap-2 shrink-0">
        <ChartNoAxesColumn size={12} className="text-[#8b949e]" />
        <span className="text-xs text-[#8b949e] font-medium whitespace-nowrap">
          Cashflow Ratio
        </span>
      </div>

      <div className="h-3 rounded-full overflow-hidden gap-0.5 bg-[#1a2d3d] flex sm:flex-1">
        <div
          className="h-full bg-[#00C896] transition-all duration-500"
          style={{ width: `${incomePercent}%` }}
        />
        <div
          className="h-full bg-red-400 transition-all duration-500"
          style={{ width: `${expensesPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-center gap-3 flex-wrap text-xs text-[#8b949e]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00C896] inline-block" />
          Income{' '}
          <span className="font-medium text-white">{incomePercent}%</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block" />
          Expenses{' '}
          <span className="font-medium text-white">{expensesPercent}%</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-400 inline-block" />
          Saved{' '}
          <span className="font-medium text-white">{savingsPercent}%</span>
        </span>
      </div>
    </div>
  )
}
