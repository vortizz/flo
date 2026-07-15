'use client'

import { createElement, useState } from 'react'
import Image from 'next/image'
import {
  X,
  RefreshCw,
  Unlink,
  Loader2,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  type AccountDetail,
  fetchAccountDetail,
  fetchBalanceHistory,
  syncAccount,
  deleteAccount,
} from '@/lib/api/accounts'
import CashAvatar from '@/components/ui/CashAvatar'
import DisconnectModal from './DisconnectModal'
import { Toast } from '@/components/ui/Toast'
import { fetchTransactions } from '@/lib/api/transactions'
import { getCategoryIcon } from '../ui/categoryIcon'
import Link from 'next/link'

const SHOW_BALANCE_HISTORY = ['transaction', 'savings']

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(Math.abs(amount))
}

function formatLastSync(dateStr: string | null) {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60))
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function formatChartDate(dateStr: string) {
  return new Date(`${dateStr}T12:00:00Z`).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
  })
}

function formatAUDShort(value: number) {
  if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-3 text-xs flex flex-col gap-1">
      <span className="text-[#8b949e] font-medium">{label}</span>
      <span className="text-white font-semibold">
        {new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD',
          minimumFractionDigits: 2,
        }).format(payload[0].value)}
      </span>
    </div>
  )
}

function BankAvatar({
  name,
  logoUrl,
  isCash,
}: {
  name: string
  logoUrl: string | null
  isCash: boolean
}) {
  if (isCash) return <CashAvatar size="xl" />
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={48}
        height={48}
        className="rounded-full"
      />
    )
  }
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <div className="w-12 h-12 rounded-full bg-[#1a2d3d] flex items-center justify-center text-sm font-bold text-white">
      {initials}
    </div>
  )
}

export default function AccountDetailPanel({
  accountId,
  onClose,
  onDisconnected,
}: {
  accountId: string
  onClose: () => void
  onDisconnected: () => void
}) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [isSyncing, setIsSyncing] = useState(false)
  const [showDisconnect, setShowDisconnect] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const { data: account, isLoading: accountLoading } = useQuery({
    queryKey: ['account-detail', accountId],
    queryFn: () => fetchAccountDetail(accountId, getToken),
    staleTime: 0,
  })

  const { data: recentTransactions } = useQuery({
    queryKey: ['account-recent-transactions', accountId],
    queryFn: () => fetchTransactions({ limit: 5, accountId }, getToken),
  })

  const showHistory =
    account?.isCash || SHOW_BALANCE_HISTORY.includes(account?.accountType ?? '')

  const { data: balanceHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['account-balance-history', accountId],
    queryFn: () => fetchBalanceHistory(accountId, getToken),
    enabled: showHistory,
  })

  async function handleSync() {
    if (!account) return
    setIsSyncing(true)
    try {
      const result = await syncAccount(accountId, getToken)
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['account-detail', accountId] })
      queryClient.invalidateQueries({
        queryKey: ['account-balance-history', accountId],
      })
      queryClient.invalidateQueries({
        queryKey: ['account-recent-transactions', accountId],
      })
      setToast({
        message: `Synced ${result.synced} new transaction${result.synced !== 1 ? 's' : ''}`,
        type: 'success',
      })
    } catch {
      setToast({ message: 'Failed to sync. Please try again.', type: 'error' })
    } finally {
      setIsSyncing(false)
    }
  }

  async function handleDisconnect() {
    setIsDisconnecting(true)
    try {
      await deleteAccount(accountId, getToken)
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setShowDisconnect(false)
      onDisconnected()
    } catch {
      setToast({
        message: 'Failed to disconnect. Please try again.',
        type: 'error',
      })
    } finally {
      setIsDisconnecting(false)
    }
  }

  const chartData = balanceHistory?.map(p => ({
    date: formatChartDate(p.date),
    balance: p.balance,
  }))

  const xAxisTicks = chartData
    ?.filter((_, i) => i % 5 === 0 || i === chartData.length - 1)
    .map(d => d.date)

  if (accountLoading || !account) {
    return (
      <div
        className="border-l border-[#2dd4bf]/10 flex flex-col shadow-2xl overflow-hidden w-full h-full min-h-full items-center justify-center"
        style={{
          background: 'linear-gradient(170deg, #0d1f2d 0%, #080f18 100%)',
        }}
      >
        <Loader2 size={20} className="animate-spin text-[#8b949e]" />
      </div>
    )
  }

  return (
    <>
      <div
        className="border-l border-[#2dd4bf]/10 flex flex-col shadow-2xl overflow-hidden w-full h-full min-h-full"
        style={{
          background: 'linear-gradient(170deg, #0d1f2d 0%, #080f18 100%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <h2 className="text-lg font-semibold text-white">Account Details</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1a2d3d]">
          {/* Account hero */}
          <div className="p-6 pb-4 flex flex-col items-center text-center">
            <BankAvatar
              name={account.bankName}
              logoUrl={account.logoUrl}
              isCash={account.isCash}
            />
            <p className="text-xl font-semibold text-white mt-3 mb-0.5">
              {account.accountName}
            </p>
            <p className="text-sm text-[#8b949e]">{account.bankName}</p>
            {account.last4 && (
              <p className="text-xs text-[#8b949e] mt-0.5">
                ••• {account.last4}
              </p>
            )}
            <p
              className={`text-3xl font-bold mt-4 ${account.balance < 0 ? 'text-red-400' : 'text-white'}`}
            >
              {account.balance < 0 ? '-' : ''}
              {formatAUD(account.balance)}{' '}
              <span className="text-lg font-normal text-[#64748b]">AUD</span>
            </p>

            {/* Change indicator — only for transaction and savings */}
            {showHistory &&
              balanceHistory &&
              balanceHistory.length >= 2 &&
              (() => {
                const current =
                  balanceHistory[balanceHistory.length - 1].balance
                const previous = balanceHistory[0].balance
                if (previous === 0) return null
                const change =
                  Math.round(
                    ((current - previous) / Math.abs(previous)) * 1000,
                  ) / 10
                const isPositive = current > previous
                return (
                  <div
                    className={`text-xs mt-1 flex items-center gap-1 ${isPositive ? 'text-[#00C896]' : 'text-red-400'}`}
                  >
                    {change > 0 ? (
                      <TrendingUp size={13} />
                    ) : (
                      <TrendingDown size={13} />
                    )}
                    {change > 0 ? '+' : ''}
                    {change}%
                    <span className="text-[#8b949e]">vs 30 days ago</span>
                  </div>
                )
              })()}
          </div>

          {/* Info fields */}
          <div className="px-6 pb-4">
            {account.isCash ? (
              <div className="grid grid-cols-2 gap-0 border border-white/5 rounded-xl bg-[#1e293b4d]">
                <div className="flex flex-col items-center gap-1 p-2 text-center border-r border-white/5">
                  <span className="text-xs font-medium text-[#8b949e] tracking-wider">
                    Status
                  </span>
                  <span className="text-xs font-semibold text-[#2dd4bf]">
                    Manual
                  </span>
                </div>

                <div className="flex flex-col items-center gap-1 p-2 text-center">
                  <span className="text-xs font-medium text-[#8b949e] tracking-wider">
                    Type
                  </span>
                  <span className="text-xs font-semibold text-white">
                    Cash Wallet
                  </span>
                </div>
              </div>
            ) : (
              <div
                className={`grid gap-0 border border-white/5 rounded-xl bg-[#1e293b4d] ${
                  account.accountType ? 'grid-cols-3' : 'grid-cols-2'
                }`}
              >
                <div className="flex flex-col items-center gap-1 p-2 text-center border-r border-white/5">
                  <span className="text-xs font-medium text-[#8b949e] tracking-wider">
                    Status
                  </span>
                  {account.status === 'connected' ? (
                    <span className="text-xs font-semibold text-[#2dd4bf]">
                      Connected
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-red-400">
                      Disconnected
                    </span>
                  )}
                </div>

                {account.accountType && (
                  <div className="flex flex-col items-center gap-1 p-2 text-center border-r border-white/5">
                    <span className="text-xs font-medium text-[#8b949e] tracking-wider">
                      Type
                    </span>
                    <span className="text-xs font-semibold text-white capitalize">
                      {account.accountType.replace('-', ' ')}
                    </span>
                  </div>
                )}

                <div className="flex flex-col items-center gap-1 p-2 text-center">
                  <span className="text-xs font-medium text-[#8b949e] tracking-wider">
                    Last Sync
                  </span>
                  <span className="text-xs font-semibold text-white">
                    {formatLastSync(account.lastSyncedAt)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Balance history chart — only for transaction and savings */}
          {showHistory && (
            <div className="px-6 pb-6">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-white">
                    Balance History
                  </p>
                  <p className="text-[10px] text-[#8b949e]">
                    Last 30 days · Estimated
                  </p>
                </div>
              </div>

              {historyLoading || !chartData ? (
                <div className="h-32 rounded-xl bg-[#0d1f2d] border border-[#1a2d3d] flex items-center justify-center">
                  <Loader2 size={16} className="animate-spin text-[#8b949e]" />
                </div>
              ) : (
                <div className="h-36 **:outline-none">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="balanceGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#00C896"
                            stopOpacity={0.15}
                          />
                          <stop
                            offset="95%"
                            stopColor="#00C896"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1a2d3d"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: '#8b949e', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        ticks={xAxisTicks}
                      />
                      <YAxis
                        domain={['auto', 'auto']}
                        tick={{ fill: '#8b949e', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={formatAUDShort}
                        width={48}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="balance"
                        stroke="#00C896"
                        strokeWidth={2}
                        fill="url(#balanceGradient)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#00C896' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}

          {/* Recent Transactions */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-medium text-white">
                  Recent Transactions
                </p>
                <p className="text-[10px] text-[#8b949e]">
                  Last 5 transactions
                </p>
              </div>
              <Link
                href={`/transactions?accountId=${accountId}`}
                className="text-xs px-2 py-1 rounded-lg text-[#00C896] border border-[#00c89633] bg-[#00c8960f] hover:bg-[#00c89620] transition-colors"
              >
                View All
              </Link>
            </div>

            {!recentTransactions || recentTransactions.data.length === 0 ? (
              <div className="w-full p-4 rounded-xl border border-white/5 bg-[#1e293b4d] flex items-center justify-center">
                <p className="text-xs text-[#8b949e]">No transactions found</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {recentTransactions.data.map(tx => {
                  const Icon = getCategoryIcon(tx.categoryIcon)
                  return (
                    <div key={tx.id} className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor:
                            Icon && tx.categoryColor
                              ? `${tx.categoryColor}20`
                              : '#1a2d3d',
                        }}
                      >
                        {Icon ? (
                          createElement(Icon, {
                            size: 14,
                            style: { color: tx.categoryColor ?? '#8b949e' },
                          })
                        ) : (
                          <span className="text-xs font-semibold text-[#8b949e]">
                            {tx.merchant?.charAt(0).toUpperCase() ?? '?'}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                          {tx.merchant}
                        </p>
                        <p className="text-[10px] text-[#8b949e] truncate">
                          {tx.category ?? 'Uncategorised'} ·{' '}
                          {new Date(tx.date).toLocaleDateString('en-AU', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <p
                          className={`text-xs font-semibold ${tx.type === 'CREDIT' ? 'text-[#00C896]' : 'text-white'}`}
                        >
                          {tx.type === 'CREDIT' ? '+' : '-'}
                          {new Intl.NumberFormat('en-AU', {
                            style: 'currency',
                            currency: 'AUD',
                            minimumFractionDigits: 2,
                          }).format(tx.amount)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        {!account.isCash && (
          <div className="px-6 py-5 border-t border-[#1a2d3d] shrink-0">
            <div className="flex gap-3">
              <button
                onClick={() => setShowDisconnect(true)}
                className="flex-1 py-3 rounded-xl border border-[#1a2d3d] text-[#8b949e] hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Unlink size={14} />
                Disconnect
              </button>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex-1 py-3 rounded-xl bg-[#00C896] hover:bg-[#00b084] text-black text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={isSyncing ? 'animate-spin' : ''}
                />
                {isSyncing ? 'Syncing...' : 'Sync'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showDisconnect && (
        <DisconnectModal
          accountName={account.accountName}
          bankName={account.bankName}
          onConfirm={handleDisconnect}
          onCancel={() => setShowDisconnect(false)}
          isLoading={isDisconnecting}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
