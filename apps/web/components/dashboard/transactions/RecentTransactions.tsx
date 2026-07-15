'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { fetchRecentTransactions } from '@/lib/api/dashboard'
import RecentTransactionsSkeleton from './RecentTransactionsSkeleton'
import { PERIOD_MAP, useDashboard } from '../layout/DashboardContext'
import { getCategoryIcon } from '@/components/ui/categoryIcon'
import { createElement } from 'react'

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(dateStr: string, isCash: boolean) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days <= 0) {
    if (isCash) return 'Today'
    return `Today, ${date.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  }
  if (days === 1) return 'Yesterday'
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function CategoryAvatar({
  categoryIcon,
  categoryColor,
  merchant,
}: {
  categoryIcon: string | null
  categoryColor: string | null
  merchant: string
}) {
  const Icon = getCategoryIcon(categoryIcon)

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
      style={{
        backgroundColor:
          Icon && categoryColor ? `${categoryColor}20` : '#1a2d3d',
      }}
    >
      {Icon ? (
        createElement(Icon, {
          size: 16,
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

export default function RecentTransactions() {
  const { getToken } = useAuth()
  const { period, customRange } = useDashboard()

  const apiPeriod = PERIOD_MAP[period] ?? 'week'
  const fromStr = customRange?.from
    ? `${customRange.from.getFullYear()}-${String(customRange.from.getMonth() + 1).padStart(2, '0')}-${String(customRange.from.getDate()).padStart(2, '0')}`
    : undefined

  const toStr = customRange?.to
    ? `${customRange.to.getFullYear()}-${String(customRange.to.getMonth() + 1).padStart(2, '0')}-${String(customRange.to.getDate()).padStart(2, '0')}`
    : undefined

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
            <CategoryAvatar
              categoryIcon={tx.categoryIcon}
              categoryColor={tx.categoryColor}
              merchant={tx.merchant}
            />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {tx.merchant}
              </p>
              <p className="text-xs text-[#8b949e] truncate">
                {tx.category ?? 'Uncategorised'} ·{' '}
                {formatDate(tx.date, tx.isCash)}
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
