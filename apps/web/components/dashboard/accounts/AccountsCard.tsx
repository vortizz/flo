'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import Image from 'next/image'
import {
  fetchDashboardAccounts,
  type DashboardAccount,
} from '@/lib/api/dashboard'
import AccountsCardSkeleton from './AccountsCardSkeleton'

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount))
}

function BankAvatar({
  name,
  logoUrl,
}: {
  name: string
  logoUrl: string | null
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={36}
        height={36}
        className="rounded-full shrink-0"
      />
    )
  }
  const colors: Record<string, string> = {
    CBA: '#f5a623',
    ANZ: '#007DBA',
    NAB: '#CC0000',
    WBC: '#D5002B',
    AMEX: '#006FCF',
  }
  const key = Object.keys(colors).find(k => name.toUpperCase().includes(k))
  const bg = key ? colors[key] : '#1a2d3d'
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ background: bg }}
    >
      {initials}
    </div>
  )
}

function AccountRow({ account }: { account: DashboardAccount }) {
  const isNegative = account.balance < 0
  const hasChange = account.dailyChange !== 0

  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#ffffff04] border border-[#1a2d3d] mb-2 last:mb-0">
      <BankAvatar name={account.bankName} logoUrl={account.logoUrl} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {account.accountName}
        </p>
        <p className="text-xs text-[#8b949e]">
          {account.last4 ? `••• ${account.last4}` : account.bankName}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={`text-sm font-semibold ${isNegative ? 'text-red-400' : 'text-white'}`}
        >
          {isNegative ? '-' : ''}
          {formatAUD(account.balance)}
        </p>
        {hasChange && (
          <p
            className={`text-[9px] tracking-wide ${account.dailyChange > 0 ? 'text-[#00C896]' : 'text-red-400'}`}
          >
            {account.dailyChange > 0 ? '+' : '-'}
            {formatAUD(account.dailyChange)} today
          </p>
        )}
      </div>
    </div>
  )
}

export default function AccountsCard() {
  const { getToken } = useAuth()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-accounts'],
    queryFn: () => fetchDashboardAccounts(getToken),
    staleTime: 30_000,
  })

  if (isLoading) return <AccountsCardSkeleton />

  if (isError || !data) {
    return (
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex items-center justify-center h-48">
        <p className="text-sm text-[#8b949e]">Unable to load accounts.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Accounts</h3>
          <p className="text-xs text-[#8b949e] mt-0.5">
            {data.totalAccounts} connected ·{' '}
            <span className="text-[#e6edf3]">Current balances</span>
          </p>
        </div>
        <Link
          href="/accounts"
          className="text-xs px-2.5 py-1.5 rounded-lg text-[#00C896] border border-[#00c89633] bg-[#00c8960f]"
        >
          View All
        </Link>
      </div>

      {/* Account rows */}
      <div className="px-5 flex-1 overflow-y-auto max-h-70 pb-1">
        {data.accounts.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#8b949e]">No accounts connected.</p>
          </div>
        ) : (
          data.accounts.map(account => (
            <AccountRow key={account.id} account={account} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-[#1a2d3d] flex items-center justify-between">
        <span className="text-xs text-[#8b949e]">Total Balance</span>
        <span className="text-sm font-bold text-white">
          {new Intl.NumberFormat('en-AU', {
            style: 'currency',
            currency: 'AUD',
            minimumFractionDigits: 2,
          }).format(data.totalBalance)}{' '}
          <span className="text-xs font-normal text-[#8b949e]">AUD</span>
        </span>
      </div>
    </div>
  )
}
