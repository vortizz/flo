export type Period = 'week' | 'fortnight' | 'month' | 'year'

export interface SummaryTotals {
  income: number
  expenses: number
  savings: number
}

export interface SummaryResponse {
  period: Period
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

export async function fetchSummary(
  period: Period,
  getToken: () => Promise<string | null>,
): Promise<SummaryResponse> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/summary?period=${period}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Failed to fetch summary')
  return res.json()
}

export async function fetchChart(
  period: Period,
  getToken: () => Promise<string | null>,
): Promise<ChartDataPoint[]> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/chart?period=${period}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Failed to fetch chart data')
  return res.json()
}
