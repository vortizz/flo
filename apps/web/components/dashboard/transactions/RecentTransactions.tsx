'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { fetchRecentTransactions } from '@/lib/api/dashboard'
import RecentTransactionsSkeleton from './RecentTransactionsSkeleton'
import { PERIOD_MAP, useDashboard } from '../layout/DashboardContext'

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days <= 0) {
    return `Today, ${date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  }
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function MerchantIcon({ merchant }: { merchant: string }) {
  const initial = merchant?.charAt(0).toUpperCase() ?? '?'
  return (
    <div className="w-9 h-9 rounded-full bg-[#1a2d3d] flex items-center justify-center shrink-0">
      <span className="text-xs font-semibold text-[#8b949e]">{initial}</span>
    </div>
  )
}

export default function RecentTransactions() {
  const { getToken } = useAuth()
  const { period, customRange } = useDashboard()

  const apiPeriod = PERIOD_MAP[period] ?? 'week'
  const fromStr = customRange?.from?.toISOString().split('T')[0]
  const toStr = customRange?.to?.toISOString().split('T')[0]

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-recent-transactions', apiPeriod, fromStr, toStr],
    queryFn: () => fetchRecentTransactions(getToken, apiPeriod, fromStr, toStr),
    enabled: apiPeriod !== 'custom' || (!!fromStr && !!toStr),
    staleTime: 0,
  })

  const subtitle =
    period === 'Custom' && customRange?.from && customRange?.to
      ? `${customRange.from.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${customRange.to.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
      : `Last ${data?.length} transactions`

  if (isLoading) return <RecentTransactionsSkeleton />

  if (isError || !data) {
    return (
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5">
        <p className="text-sm text-[#8b949e]">Unable to load transactions.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">
            Recent Transactions
          </h2>
          <p className="text-xs text-[#8b949e]">{subtitle}</p>
        </div>
        <Link
          href="/transactions"
          className="text-xs px-2.5 py-1.5 rounded-lg text-[#00C896] border border-[#00c89633] bg-[#00c8960f]"
        >
          View all
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {data.map(tx => (
          <div key={tx.id} className="flex items-center gap-3">
            <MerchantIcon merchant={tx.merchant} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {tx.merchant}
              </p>
              <p className="text-xs text-[#8b949e] truncate">
                {tx.category ?? 'Uncategorised'} · {formatDate(tx.date)}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p
                className={`text-sm font-semibold ${tx.type === 'CREDIT' ? 'text-[#00C896]' : 'text-white'}`}
              >
                {tx.type === 'CREDIT' ? '+' : '-'}
                {formatAUD(tx.amount)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
