'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { useDashboard } from '@/components/dashboard/layout/DashboardContext'
import { fetchSummary } from '@/lib/api/dashboard'
import SummaryCardSkeleton from './SummaryCardSkeleton'
import SummaryCard from './SummaryCard'
import CashflowRatio from './CashflowRatio'

const PERIOD_MAP = {
  'This Week': 'week',
  'This Fortnight': 'fortnight',
  'This Month': 'month',
  Custom: 'month',
} as const

export default function SummaryCards() {
  const { period } = useDashboard()
  const { getToken } = useAuth()

  const apiPeriod = PERIOD_MAP[period] ?? 'week'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary', apiPeriod],
    queryFn: () => fetchSummary(apiPeriod, getToken),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>
      </div>
    )
  }

  if (isError || !data) {
    return (
      <p className="text-sm text-[#8b949e]">
        Unable to load summary. Please try again.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCard
          label="Income"
          amount={data.current.income}
          previousAmount={data.previous.income}
          change={data.changes.income}
          type="income"
        />
        <SummaryCard
          label="Expenses"
          amount={data.current.expenses}
          previousAmount={data.previous.expenses}
          change={data.changes.expenses}
          type="expenses"
        />
        <SummaryCard
          label="Net Savings"
          amount={data.current.savings}
          previousAmount={data.previous.savings}
          change={data.changes.savings}
          type="savings"
        />
      </div>
      <CashflowRatio
        income={data.current.income}
        expenses={data.current.expenses}
        savings={data.current.savings}
      />
    </div>
  )
}
