'use client'

import { createContext, useContext, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export const PERIOD_MAP = {
  'This Week': 'week',
  'This Fortnight': 'fortnight',
  'This Month': 'month',
  Custom: 'custom',
} as const

export type Period = keyof typeof PERIOD_MAP
export type ApiPeriod = (typeof PERIOD_MAP)[Period]
export const VALID_PERIODS = Object.keys(PERIOD_MAP) as Period[]

export interface DateRange {
  from: Date | undefined
  to?: Date | undefined
}

interface DashboardContextValue {
  period: Period
  setPeriod: (p: Period) => void
  customRange: DateRange | undefined
  setCustomRange: (range: DateRange | undefined) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const API_TO_PERIOD = Object.fromEntries(
    Object.entries(PERIOD_MAP).map(([k, v]) => [v, k]),
  ) as Record<ApiPeriod, Period>

  const rawPeriod = searchParams.get('period') as ApiPeriod | null
  const period: Period =
    rawPeriod && rawPeriod in API_TO_PERIOD
      ? API_TO_PERIOD[rawPeriod]
      : 'This Week'

  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')
  const customRange: DateRange | undefined =
    fromParam && toParam
      ? {
          from: new Date(fromParam + 'T00:00:00'),
          to: new Date(toParam + 'T00:00:00'),
        }
      : undefined

  const setPeriod = useCallback(
    (p: Period) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('period', PERIOD_MAP[p])
      if (p !== 'Custom') {
        params.delete('from')
        params.delete('to')
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  const setCustomRange = useCallback(
    (range: DateRange | undefined) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('period', 'custom')
      if (range?.from) {
        const f = range.from
        params.set(
          'from',
          `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`,
        )
      }
      if (range?.to) {
        const t = range.to
        params.set(
          'to',
          `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`,
        )
      }
      router.push(`${pathname}?${params.toString()}`)
    },
    [router, pathname, searchParams],
  )

  return (
    <DashboardContext.Provider
      value={{ period, setPeriod, customRange, setCustomRange }}
    >
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
