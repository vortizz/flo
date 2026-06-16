'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { DashboardProvider } from './DashboardContext'
import Sidebar from './Sidebar'
import TopBar from './TopBar'
import AddTransactionModal from '@/components/transactions/AddTransactionModal'
import { useQueryClient } from '@tanstack/react-query'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
  title?: string
}) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showAddTransaction, setShowAddTransaction] = useState(false)
  const [isDesktop, setIsDesktop] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(min-width: 1024px)').matches,
  )
  const queryClient = useQueryClient()

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = (e: MediaQueryListEvent) => {
      setIsDesktop(e.matches)
      if (e.matches) setMobileOpen(false)
      else setCollapsed(false)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const toggle = useCallback(() => {
    if (isDesktop) setCollapsed(v => !v)
    else setMobileOpen(v => !v)
  }, [isDesktop])

  return (
    <Suspense>
      <DashboardProvider>
        <div
          className="flex h-screen w-full overflow-hidden"
          style={{
            background:
              'radial-gradient(ellipse at 30% 50%, #0d2d42 0%, #071828 20%, #040e1a 50%, #020810 100%)',
          }}
        >
          {mobileOpen && (
            <div
              className="fixed inset-0 bg-black/60 z-30 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
          )}

          <Sidebar
            collapsed={collapsed}
            mobileOpen={mobileOpen}
            onClose={() => setMobileOpen(false)}
            onAddTransaction={() => setShowAddTransaction(true)}
          />

          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            <TopBar
              onMenuToggle={toggle}
              onAddTransaction={() => setShowAddTransaction(true)}
            />
            <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1a2d3d]">
              {children}
            </main>
          </div>
        </div>

        {showAddTransaction && (
          <AddTransactionModal
            onClose={() => setShowAddTransaction(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['transactions'] })
              queryClient.invalidateQueries({ queryKey: ['accounts'] })
            }}
          />
        )}
      </DashboardProvider>
    </Suspense>
  )
}
