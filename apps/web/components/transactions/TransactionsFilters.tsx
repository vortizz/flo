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

const CATEGORY_COLORS: Record<string, string> = {
  'Cafes, Restaurants and Takeaway Food Services': '#ec4899',
  'Supermarket and Grocery Stores': '#3b82f6',
  'Fuel Retailing': '#f97316',
  'Non-Depository Financing': '#8b949e',
  'Television Broadcasting': '#a855f7',
  'Property Operators': '#f59e0b',
  'Department Stores': '#06b6d4',
  'Telecommunications Services': '#6366f1',
  'Health and General Insurance': '#10b981',
  'Internet Publishing and Broadcasting': '#8b5cf6',
  'Sports and Physical Recreation Activities': '#00C896',
  'Air and Space Transport': '#0ea5e9',
  'Specialised Food Retailing': '#f472b6',
  'Pubs, Taverns and Bars': '#fb923c',
  'Electricity Distribution': '#facc15',
  'Other Health Care Services': '#34d399',
  'Auxiliary Finance and Investment Services': '#60a5fa',
  'Water Supply, Sewerage and Drainage Services': '#38bdf8',
  Other: '#8b949e',
}

interface TransactionsFiltersProps {
  type: 'DEBIT' | 'CREDIT' | undefined
  onTypeChange: (v: 'DEBIT' | 'CREDIT' | undefined) => void
  days: string
  onDaysChange: (v: string) => void
  accountId: string | undefined
  onAccountChange: (v: string | undefined) => void
  category: string | undefined
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
  category,
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
      label: c,
      value: c,
      color: CATEGORY_COLORS[c] ?? '#8b949e',
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
            value={category ?? ''}
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
