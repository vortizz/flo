'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { fetchAccounts } from '@/lib/api/accounts'
import AccountRow from './AccountRow'
import AccountsTableSkeleton from './AccountsTableSkeleton'
import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import AccountsSummaryCards from './AccountsSummaryCards'
import AccountsSummaryCardsSkeleton from './AccountsSummaryCardsSkeleton'

type Tab = 'all' | 'connected' | 'disconnected' | 'manual'

export default function AccountsTable() {
  const { getToken } = useAuth()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('all')

  const { data, isLoading, isError } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => fetchAccounts(getToken),
  })

  const tabs: { label: string; value: Tab }[] = [
    { label: 'All', value: 'all' },
    { label: 'Connected', value: 'connected' },
    { label: 'Disconnected', value: 'disconnected' },
    { label: 'Manual', value: 'manual' },
  ]

  const filtered =
    data?.accounts.filter(a => (tab === 'all' ? true : a.status === tab)) ?? []

  if (isLoading)
    return (
      <div className="flex flex-col gap-4">
        <AccountsSummaryCardsSkeleton />
        <AccountsTableSkeleton />
      </div>
    )

  if (isError || !data) {
    return (
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-8 flex items-center justify-center">
        <p className="text-sm text-[#8b949e]">
          Unable to load accounts. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <AccountsSummaryCards
        totalBalance={data.summary.totalBalance}
        totalAccounts={data.summary.totalAccounts}
        lastSyncedAt={data.summary.lastSyncedAt}
      />
      {/* Tabs + actions row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-1 bg-[#0d1f2d] border border-[#1a2d3d] rounded-lg p-1">
          {tabs.map(t => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={[
                'px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                tab === t.value
                  ? 'bg-[#1e293b] text-white border border-[#1a2d3d]'
                  : 'text-[#8b949e] hover:text-white',
              ].join(' ')}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[linear-gradient(145deg,rgba(30,41,59,0.7)_0%,rgba(15,23,42,0.4)_100%)] backdrop-blur-md shadow-[0_4px_24px_-1px_rgba(0,0,0,0.2)] border border-[#ffffff0d] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="hidden md:grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1.5fr_80px] gap-4 px-6 py-3 border-b border-[#1a2d3d]">
          {[
            'Bank',
            'Account Name',
            'Currency',
            'Balance',
            'Last Sync',
            'Status',
            'Actions',
          ].map(h => (
            <span
              key={h}
              className="text-xs font-semibold text-[#94a3b8] uppercase tracking-wider"
            >
              {h}
            </span>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <p className="text-sm font-medium text-white">No accounts found</p>
            <p className="text-xs text-[#8b949e]">
              Connect a bank account to get started
            </p>
          </div>
        )}

        {/* Rows */}
        {filtered.map(account => (
          <AccountRow key={account.id} account={account} />
        ))}

        {/* Connect new account row */}
        <div
          onClick={() => router.push('/onboarding?source=accounts')}
          className="px-6 py-4 flex items-center gap-3 hover:bg-[#ffffff04] transition-colors cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full border-2 border-dashed border-[#1a2d3d] flex items-center justify-center text-[#8b949e]">
            <Plus width={16} height={16} />
          </div>
          <span className="text-sm text-[#8b949e]">Connect New Account</span>
        </div>
      </div>
    </div>
  )
}
