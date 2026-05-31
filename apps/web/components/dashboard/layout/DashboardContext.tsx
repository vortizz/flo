'use client'

import { createContext, useContext, useState } from 'react'

export type Period = 'This Month' | 'Last Month' | 'YTD' | 'Custom'

interface DashboardContextValue {
  period: Period
  setPeriod: (p: Period) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [period, setPeriod] = useState<Period>('This Month')
  return (
    <DashboardContext.Provider value={{ period, setPeriod }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx)
    throw new Error('useDashboard must be used inside DashboardProvider')
  return ctx
}
