'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import {
  Tag,
  LayoutGrid,
  TrendingDown,
  TrendingUp,
  Search,
  X,
} from 'lucide-react'
import { fetchFilterOptions } from '@/lib/api/transactions'
import FilterDropdown from './FilterDropdown'
import AccountFilterDropdown from './AccountFilterDropdown'
import DateFilterDropdown from './DateFilterDropdown'
import TransactionsFiltersSkeleton from './TransactionsFiltersSkeleton'

interface TransactionsFiltersProps {
  type: 'DEBIT' | 'CREDIT' | undefined
  onTypeChange: (v: 'DEBIT' | 'CREDIT' | undefined) => void
  days: string
  onDaysChange: (v: string) => void
  accountId: string | undefined
  onAccountChange: (v: string | undefined) => void
  categoryId: string | undefined
  onCategoryChange: (v: string | undefined) => void
  customRange: { from: Date | undefined; to?: Date | undefined } | undefined
  onCustomRangeChange: (
    range: { from: Date | undefined; to?: Date | undefined } | undefined,
  ) => void
  search: string
  onSearchChange: (v: string) => void
  hasActiveFilters: boolean
  onClearAll: () => void
}

export default function TransactionsFilters({
  type,
  onTypeChange,
  days,
  onDaysChange,
  accountId,
  onAccountChange,
  categoryId,
  onCategoryChange,
  customRange,
  onCustomRangeChange,
  search,
  onSearchChange,
  hasActiveFilters,
  onClearAll,
}: TransactionsFiltersProps) {
  const { getToken } = useAuth()

  const { data: filterOptions, isLoading: filtersLoading } = useQuery({
    queryKey: ['transactions-filter-options'],
    queryFn: () => fetchFilterOptions(getToken),
  })

  const categoryOptions = [
    { label: 'All Categories', value: '' },
    ...(filterOptions?.categories.map(c => ({
      label: c.name,
      value: c.id,
      color: c.color,
    })) ?? []),
  ]

  const typeOptions = [
    { label: 'All Types', value: '', icon: <LayoutGrid size={12} /> },
    {
      label: 'Expenses',
      value: 'DEBIT',
      icon: <TrendingDown size={12} className="text-red-400" />,
    },
    {
      label: 'Income',
      value: 'CREDIT',
      icon: <TrendingUp size={12} className="text-[#00C896]" />,
    },
  ]

  if (filtersLoading) return <TransactionsFiltersSkeleton />

  return (
    <div className="flex flex-col gap-3">
      <div className="relative">
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8]"
        />
        <input
          type="text"
          placeholder="Search by merchant..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          className="w-full bg-[#0f172a] border border-white/10 rounded-lg pl-10 pr-10 py-2.5 text-sm text-white placeholder-[#8b949e] focus:outline-none focus:border-[#00C896]/60 transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-6 pt-2 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <DateFilterDropdown
            days={days}
            onDaysChange={onDaysChange}
            customRange={customRange}
            onCustomRangeChange={onCustomRangeChange}
          />
          <AccountFilterDropdown
            accounts={filterOptions?.accounts ?? []}
            value={accountId ?? ''}
            onChange={v => onAccountChange(v || undefined)}
          />
          <FilterDropdown
            icon={<Tag size={14} />}
            options={categoryOptions}
            value={categoryId ?? ''}
            onChange={v => onCategoryChange(v || undefined)}
          />
          <FilterDropdown
            icon={<LayoutGrid size={12} />}
            options={typeOptions}
            value={type ?? ''}
            onChange={v => onTypeChange((v as 'DEBIT' | 'CREDIT') || undefined)}
          />
          {hasActiveFilters && (
            <button
              onClick={onClearAll}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
