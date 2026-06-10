import { ApiPeriod } from '@/components/dashboard/layout/DashboardContext'

export interface SummaryTotals {
  income: number
  expenses: number
  savings: number
}

export interface SummaryResponse {
  period: ApiPeriod
  current: SummaryTotals
  previous: SummaryTotals
  changes: {
    income: number
    expenses: number
    savings: number
  }
}

export interface ChartDataPoint {
  date: string
  income: number
  expenses: number
}

export interface CategoryDataPoint {
  category: string
  amount: number
  percentage: number
}

export interface RecentTransaction {
  id: string
  merchant: string
  category: string | null
  date: string
  amount: number
  type: 'DEBIT' | 'CREDIT'
  account: string
}

export interface DashboardAccount {
  id: string
  bankName: string
  accountName: string
  last4: string | null
  balance: number
  logoUrl: string | null
  dailyChange: number
}

export interface DashboardAccountsResponse {
  totalBalance: number
  totalAccounts: number
  accounts: DashboardAccount[]
}

export async function fetchSummary(
  period: string,
  getToken: () => Promise<string | null>,
  from?: string,
  to?: string,
): Promise<SummaryResponse> {
  const token = await getToken()
  const params = new URLSearchParams({ period })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/summary?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Failed to fetch summary')
  return res.json()
}

export async function fetchChart(
  period: ApiPeriod,
  getToken: () => Promise<string | null>,
  from?: string,
  to?: string,
): Promise<ChartDataPoint[]> {
  const token = await getToken()
  const params = new URLSearchParams({ period })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/chart?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Failed to fetch chart data')
  return res.json()
}

export async function fetchCategories(
  period: ApiPeriod,
  getToken: () => Promise<string | null>,
  from?: string,
  to?: string,
): Promise<CategoryDataPoint[]> {
  const token = await getToken()
  const params = new URLSearchParams({ period })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/categories?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function fetchRecentTransactions(
  getToken: () => Promise<string | null>,
  period: ApiPeriod,
  from?: string,
  to?: string,
): Promise<RecentTransaction[]> {
  const token = await getToken()
  const params = new URLSearchParams({ period })
  if (from) params.set('from', from)
  if (to) params.set('to', to)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/recent-transactions?${params}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Failed to fetch recent transactions')
  return res.json()
}

export async function fetchDashboardAccounts(
  getToken: () => Promise<string | null>,
): Promise<DashboardAccountsResponse> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/accounts`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Failed to fetch dashboard accounts')
  return res.json()
}
