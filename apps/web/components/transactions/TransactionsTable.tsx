'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { fetchTransactions, type Transaction } from '@/lib/api/transactions'
import TransactionsTableSkeleton from './TransactionsTableSkeleton'
import TransactionRow from './TransactionRow'
import TransactionsPagination from './TransactionsPagination'
import TransactionsFilters from './TransactionsFilters'
import { useDebounce } from '@/hooks/useDebounce'

function groupByDate(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>()
  for (const tx of transactions) {
    const date = new Date(tx.date)
    const now = new Date()
    const diff = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    )
    const key =
      diff === 0
        ? 'Today'
        : diff === 1
          ? 'Yesterday'
          : date.toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }
  return groups
}

export default function TransactionsTable() {
  const { getToken } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const getInitialParams = () => {
    if (typeof window === 'undefined') return new URLSearchParams()
    return new URLSearchParams(window.location.search)
  }

  const initParams = getInitialParams()

  // Local state — source of truth
  const [page, setPage] = useState(parseInt(initParams.get('page') ?? '1'))
  const [search, setSearch] = useState(initParams.get('search') ?? '')
  const [type, setType] = useState<'DEBIT' | 'CREDIT' | undefined>(
    (initParams.get('type') as 'DEBIT' | 'CREDIT') || undefined,
  )
  const [days, setDays] = useState(initParams.get('days') ?? '30')

  const [accountId, setAccountId] = useState<string | undefined>(
    initParams.get('accountId') || undefined,
  )
  const [category, setCategory] = useState<string | undefined>(
    initParams.get('category') || undefined,
  )
  const [customRange, setCustomRange] = useState<
    { from: Date | undefined; to?: Date | undefined } | undefined
  >(() => {
    const from = initParams.get('from')
    const to = initParams.get('to')
    return from && to
      ? {
          from: new Date(from + 'T00:00:00.000Z'),
          to: new Date(to + 'T00:00:00.000Z'),
        }
      : undefined
  })

  const debouncedSearch = useDebounce(search, 500)

  // Sync to URL as side effect
  useEffect(() => {
    const params = new URLSearchParams()
    if (page > 1) params.set('page', String(page))
    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (days !== '30') params.set('days', days)
    if (accountId) params.set('accountId', accountId)
    if (category) params.set('category', category)
    if (days === 'custom' && customRange?.from)
      params.set('from', customRange.from.toISOString().split('T')[0])
    if (days === 'custom' && customRange?.to)
      params.set('to', customRange.to.toISOString().split('T')[0])
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [
    page,
    search,
    type,
    days,
    customRange,
    accountId,
    category,
    pathname,
    router,
  ])

  const fromStr =
    days === 'custom' && customRange?.from
      ? customRange.from.toISOString().split('T')[0]
      : new Date(Date.now() - (parseInt(days) || 30) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

  const toStr =
    days === 'custom' && customRange?.to
      ? customRange.to.toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]

  const hasActiveFilters = !!(
    type ||
    accountId ||
    category ||
    days !== '30' ||
    search
  )

  const filters = {
    type,
    onTypeChange: (v: 'DEBIT' | 'CREDIT' | undefined) => {
      setType(v)
      setPage(1)
    },
    days,
    onDaysChange: (v: string) => {
      setDays(v)
      setPage(1)
    },
    customRange,
    onCustomRangeChange: (
      v: { from: Date | undefined; to?: Date | undefined } | undefined,
    ) => {
      setCustomRange(v)
      setPage(1)
    },
    accountId,
    onAccountChange: (v: string | undefined) => {
      setAccountId(v)
      setPage(1)
    },
    category,
    onCategoryChange: (v: string | undefined) => {
      setCategory(v)
      setPage(1)
    },
    search,
    onSearchChange: (v: string) => {
      setSearch(v)
      setPage(1)
    },
    hasActiveFilters,
    onClearAll: () => {
      setPage(1)
      setSearch('')
      setType(undefined)
      setDays('30')
      setCustomRange(undefined)
      setAccountId(undefined)
      setCategory(undefined)
    },
  }

  const { data, isLoading, isFetching, isError } = useQuery({
    queryKey: [
      'transactions',
      page,
      type,
      days,
      fromStr,
      toStr,
      accountId,
      category,
      debouncedSearch,
    ],
    queryFn: () =>
      fetchTransactions(
        {
          page,
          limit: 10,
          type,
          accountId,
          category,
          from: fromStr,
          to: toStr,
          search: debouncedSearch || undefined,
        },
        getToken,
      ),
    staleTime: 0,
    placeholderData: prev => prev,
  })

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-4">
        <TransactionsFilters {...filters} />
        <TransactionsTableSkeleton />
      </div>
    )
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col gap-4">
        <TransactionsFilters {...filters} />
        <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-8 flex items-center justify-center">
          <p className="text-sm text-[#8b949e]">
            Unable to load transactions. Please try again.
          </p>
        </div>
      </div>
    )
  }

  const grouped = groupByDate(data.data)

  return (
    <div className="flex flex-col gap-6">
      <TransactionsFilters {...filters} />

      <div
        className={[
          'bg-[linear-gradient(145deg,rgba(30,41,59,0.7)_0%,rgba(15,23,42,0.4)_100%)] backdrop-blur-md',
          'shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)] border border-[#ffffff0d] rounded-xl overflow-hidden',
          'transition-opacity duration-200',
          isFetching ? 'opacity-60' : 'opacity-100',
        ].join(' ')}
      >
        <div className="hidden md:grid grid-cols-[1fr_2fr_1.5fr_1fr_1fr] gap-4 px-6 py-3 border-b border-[#1a2d3d]">
          {['Date', 'Merchant', 'Category', 'Account', 'Amount'].map(h => (
            <span
              key={h}
              className={[
                'text-xs font-semibold text-[#94a3b8] uppercase tracking-wider',
                h === 'Amount' ? 'text-right' : '',
              ].join(' ')}
            >
              {h}
            </span>
          ))}
        </div>

        {data.data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm font-medium text-white">
              No transactions found
            </p>
            <p className="text-xs text-[#8b949e]">Try adjusting your filters</p>
          </div>
        )}

        {[...grouped.entries()].map(([date, txs]) => (
          <div key={date}>
            <div className="px-6 py-2 bg-[#071828] border-b border-[#1a2d3d]">
              <span className="text-xs font-semibold text-[#8b949e]">
                {date}
              </span>
            </div>
            {txs.map(tx => (
              <TransactionRow key={tx.id} transaction={tx} />
            ))}
          </div>
        ))}

        {data.data.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4">
            <span className="text-sm text-[#94a3b8]">
              Showing {(page - 1) * 10 + 1} to{' '}
              {Math.min(page * 10, data.pagination.total)} of{' '}
              {data.pagination.total} entries
            </span>
            <TransactionsPagination
              page={page}
              totalPages={data.pagination.totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  )
}
