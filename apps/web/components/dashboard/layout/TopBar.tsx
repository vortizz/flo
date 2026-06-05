'use client'

import { useAuth } from '@clerk/nextjs'
import PeriodSelector from './PeriodSelector'
import { Search, Bell, Menu, RefreshCw, Plus } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { syncAllAccounts } from '@/lib/api/accounts'
import { Toast } from '@/components/ui/Toast'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Overview',
  '/transactions': 'Transactions',
  '/accounts': 'Accounts',
  '/settings': 'Settings',
}

export default function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const pathname = usePathname()
  const showPeriodSelector = pathname === '/dashboard'
  const isAccounts = pathname.startsWith('/accounts')

  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [isSyncingAll, setIsSyncingAll] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const title =
    Object.entries(ROUTE_TITLES).find(([route]) =>
      pathname.startsWith(route),
    )?.[1] ?? 'Overview'

  async function handleSyncAll() {
    setIsSyncingAll(true)
    try {
      const result = await syncAllAccounts(getToken)
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setToast({
        message:
          result.failed > 0
            ? `Synced ${result.synced} accounts, ${result.failed} failed`
            : `All ${result.synced} accounts synced successfully`,
        type: result.failed > 0 ? 'error' : 'success',
      })
    } catch (e) {
      setToast({
        message: 'Failed to sync accounts. Please try again.',
        type: 'error',
      })
    } finally {
      setIsSyncingAll(false)
    }
  }

  return (
    <header className="border-b border-white/5 bg-[#020617]/80 backdrop-blur-md shrink-0 z-10">
      <div className="flex items-center justify-between h-16 px-4 sm:h-20 sm:px-6 lg:px-8 gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            aria-label="Toggle sidebar"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu size={20} className="text-[#8b949e]" />
          </button>
          <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          {showPeriodSelector && (
            <div className="hidden sm:block">
              <PeriodSelector />
            </div>
          )}

          {isAccounts && (
            <button
              onClick={handleSyncAll}
              disabled={isSyncingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#00C896]/10 border border-[#00C896]/20 text-[#00C896] text-sm font-medium hover:bg-[#00C896]/20 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={isSyncingAll ? 'animate-spin' : ''}
              />
              {isSyncingAll ? 'Syncing...' : 'Sync All'}
            </button>
          )}

          {!isAccounts ? (
            <div className="hidden md:flex items-center gap-2 bg-[#111c2a] border border-[#1a2d3d] rounded-lg px-4 w-48 py-2 lg:w-64 focus-within:border-[#00C896]/40 transition-colors">
              <Search size={15} className="text-[#8b949e] shrink-0" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-sm text-[#e6edf3] placeholder:text-[#8b949e] w-full"
              />
            </div>
          ) : (
            <button className="flex items-center gap-2 bg-[#14b8a6] text-[#020617] font-semibold px-2 sm:px-4 py-2 rounded-lg text-sm hover:bg-[#0d9488] transition-colors">
              <Plus width={14} height={14} />
              <span className="hidden sm:block">Add Bank Account</span>
            </button>
          )}

          <button
            aria-label="Notifications"
            className="relative flex items-center justify-center w-10 h-10 border border-white/10 rounded-full hover:bg-white/5 transition-colors"
          >
            <Bell size={18} className="text-[#8b949e]" />
            <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-[#00C896] border border-[#040e1a]" />
          </button>
        </div>
      </div>

      {showPeriodSelector && (
        <div className="sm:hidden px-4 pb-3">
          <PeriodSelector />
        </div>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </header>
  )
}
