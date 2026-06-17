'use client'

import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { fetchTransactions, type Transaction } from '@/lib/api/transactions'
import TransactionsTableSkeleton from './TransactionsTableSkeleton'
import TransactionRow from './TransactionRow'
import TransactionsFilters from './TransactionsFilters'
import TransactionDetailPanel from './detail'
import { useDebounce } from '@/hooks/useDebounce'
import { Loader2 } from 'lucide-react'

const LIMIT = 20

function groupByDate(transactions: Transaction[]) {
  const groups = new Map<string, Transaction[]>()
  const now = new Date()

  const todayStr = now.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  const yesterdayStr = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  ).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  for (const tx of transactions) {
    const date = new Date(tx.date)
    const dateStr = date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })

    const key =
      dateStr === todayStr
        ? 'Today'
        : dateStr === yesterdayStr
          ? 'Yesterday'
          : dateStr

    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(tx)
  }
  return groups
}

export default function TransactionsTable() {
  const { getToken } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const sentinelRef = useRef<HTMLDivElement>(null)

  const [selectedTransaction, setSelectedTransaction] = useState<
    Transaction | undefined
  >()

  const getInitialParams = () => {
    if (typeof window === 'undefined') return new URLSearchParams()
    return new URLSearchParams(window.location.search)
  }

  const initParams = getInitialParams()

  const [search, setSearch] = useState(initParams.get('search') ?? '')
  const [type, setType] = useState<'DEBIT' | 'CREDIT' | undefined>(
    (initParams.get('type') as 'DEBIT' | 'CREDIT') || undefined,
  )
  const [days, setDays] = useState(initParams.get('days') ?? '30')
  const [accountId, setAccountId] = useState<string | undefined>(
    initParams.get('accountId') || undefined,
  )
  const [categoryId, setCategoryId] = useState<string | undefined>(
    initParams.get('categoryId') || undefined,
  )
  const [customRange, setCustomRange] = useState<
    { from: Date | undefined; to?: Date | undefined } | undefined
  >(() => {
    const from = initParams.get('from')
    const to = initParams.get('to')
    return from && to
      ? {
          from: new Date(from + 'T00:00:00'),
          to: new Date(to + 'T00:00:00'),
        }
      : undefined
  })

  const debouncedSearch = useDebounce(search, 500)

  useEffect(() => {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (type) params.set('type', type)
    if (days !== '30') params.set('days', days)
    if (accountId) params.set('accountId', accountId)
    if (categoryId) params.set('categoryId', categoryId)
    if (days === 'custom' && customRange?.from) {
      const f = customRange.from
      params.set(
        'from',
        `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`,
      )
    }
    if (days === 'custom' && customRange?.to) {
      const t = customRange.to
      params.set(
        'to',
        `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`,
      )
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }, [search, type, days, customRange, accountId, categoryId, pathname, router])

  function toLocalDateStr(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }

  const fromStr = useMemo(() => {
    if (days === 'custom' && customRange?.from) {
      return toLocalDateStr(customRange.from)
    }
    const d = new Date()
    d.setDate(d.getDate() - (parseInt(days) || 30))
    return toLocalDateStr(d)
  }, [days, customRange])

  const toStr = useMemo(() => {
    if (days === 'custom' && customRange?.to) {
      return toLocalDateStr(customRange.to)
    }
    return toLocalDateStr(new Date())
  }, [days, customRange])

  const hasActiveFilters = !!(
    type ||
    accountId ||
    categoryId ||
    days !== '30' ||
    search
  )

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: [
      'transactions',
      type,
      days,
      fromStr,
      toStr,
      accountId,
      categoryId,
      debouncedSearch,
    ],
    queryFn: ({ pageParam = 1 }) =>
      fetchTransactions(
        {
          page: pageParam as number,
          limit: LIMIT,
          type,
          accountId,
          categoryId,
          from: fromStr,
          to: toStr,
          search: debouncedSearch || undefined,
        },
        getToken,
      ),
    initialPageParam: 1,
    getNextPageParam: last => {
      if (last.pagination.page < last.pagination.totalPages) {
        return last.pagination.page + 1
      }
      return undefined
    },
    staleTime: 0,
  })

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const target = entries[0]
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage()
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [handleObserver])

  const allTransactions = useMemo(
    () => data?.pages.flatMap(p => p.data) ?? [],
    [data],
  )

  const total = data?.pages[0]?.pagination.total ?? 0

  function changeFilter(fn: () => void) {
    fn()
    setSelectedTransaction(undefined)
  }

  const filters = {
    type,
    onTypeChange: (v: 'DEBIT' | 'CREDIT' | undefined) =>
      changeFilter(() => setType(v)),
    days,
    onDaysChange: (v: string) => changeFilter(() => setDays(v)),
    customRange,
    onCustomRangeChange: (
      v: { from: Date | undefined; to?: Date | undefined } | undefined,
    ) => changeFilter(() => setCustomRange(v)),
    accountId,
    onAccountChange: (v: string | undefined) =>
      changeFilter(() => setAccountId(v)),
    categoryId,
    onCategoryChange: (v: string | undefined) =>
      changeFilter(() => setCategoryId(v)),
    search,
    onSearchChange: (v: string) => changeFilter(() => setSearch(v)),
    hasActiveFilters,
    onClearAll: () => {
      setSelectedTransaction(undefined)
      setSearch('')
      setType(undefined)
      setDays('30')
      setCustomRange(undefined)
      setAccountId(undefined)
      setCategoryId(undefined)
    },
  }

  const grouped = groupByDate(allTransactions)

  const tableContent = (
    <div
      className={[
        'bg-[linear-gradient(145deg,rgba(30,41,59,0.7)_0%,rgba(15,23,42,0.4)_100%)] backdrop-blur-md',
        'shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)] border border-[#ffffff0d] rounded-xl overflow-hidden',
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

      {allTransactions.length === 0 && (
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
            <span className="text-xs font-semibold text-[#8b949e]">{date}</span>
          </div>
          {txs.map(tx => (
            <TransactionRow
              key={tx.id}
              transaction={tx}
              isSelected={selectedTransaction?.id === tx.id}
              onClick={() => setSelectedTransaction(tx)}
            />
          ))}
        </div>
      ))}

      <div
        ref={sentinelRef}
        className="px-6 py-4 flex items-center justify-center"
      >
        {isFetchingNextPage && (
          <Loader2 size={20} className="animate-spin text-[#00C896]" />
        )}
        {!hasNextPage && allTransactions.length > 0 && (
          <p className="text-xs text-[#8b949e]">
            {total} transaction{total !== 1 ? 's' : ''} total
          </p>
        )}
      </div>
    </div>
  )

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

  return (
    <>
      {selectedTransaction && (
        <div
          className="fixed inset-0 bg-black/60 z-40 xl:hidden"
          onClick={() => setSelectedTransaction(undefined)}
        />
      )}

      <div className="flex gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0 flex-1">
          <TransactionsFilters {...filters} />
          {tableContent}
        </div>

        {selectedTransaction && (
          <div className="hidden xl:block sticky shrink-0 w-90 h-[calc(100vh-82px)] -mt-6 -mr-6 -mb-6 -top-6">
            <TransactionDetailPanel
              key={selectedTransaction.id}
              transaction={selectedTransaction}
              onClose={() => setSelectedTransaction(undefined)}
            />
          </div>
        )}

        {selectedTransaction && (
          <div className="xl:hidden fixed inset-y-0 right-0 z-50 w-full max-w-sm">
            <TransactionDetailPanel
              key={selectedTransaction.id}
              transaction={selectedTransaction}
              onClose={() => setSelectedTransaction(undefined)}
            />
          </div>
        )}
      </div>
    </>
  )
}
