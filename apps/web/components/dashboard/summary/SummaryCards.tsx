'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import {
  PERIOD_MAP,
  useDashboard,
} from '@/components/dashboard/layout/DashboardContext'
import { fetchSummary } from '@/lib/api/dashboard'
import SummaryCardSkeleton from './SummaryCardSkeleton'
import SummaryCard from './SummaryCard'
import CashflowRatio from './CashflowRatio'
import CashflowRatioSkeleton from './CashflowRatioSkeleton'

export default function SummaryCards() {
  const { period, customRange } = useDashboard()
  const { getToken } = useAuth()

  const apiPeriod = PERIOD_MAP[period] ?? 'week'

  const fromStr = customRange?.from
    ? `${customRange.from.getFullYear()}-${String(customRange.from.getMonth() + 1).padStart(2, '0')}-${String(customRange.from.getDate()).padStart(2, '0')}`
    : undefined

  const toStr = customRange?.to
    ? `${customRange.to.getFullYear()}-${String(customRange.to.getMonth() + 1).padStart(2, '0')}-${String(customRange.to.getDate()).padStart(2, '0')}`
    : undefined

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary', apiPeriod, fromStr, toStr],
    queryFn: () => fetchSummary(apiPeriod, getToken, fromStr, toStr),
    enabled: apiPeriod !== 'custom' || (!!fromStr && !!toStr),
  })

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>
        <CashflowRatioSkeleton />
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
