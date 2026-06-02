'use client'

import { useQuery } from '@tanstack/react-query'
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
import { useDashboard } from '@/components/dashboard/layout/DashboardContext'
import { fetchChart } from '@/lib/api/dashboard'
import CashflowChartSkeleton from './CashflowChartSkeleton'

const PERIOD_MAP = {
  'This Week': 'week',
  'This Fortnight': 'fortnight',
  'This Month': 'month',
  Custom: 'month',
} as const

function formatDate(dateStr: string, period: string) {
  const date = new Date(dateStr)
  if (period === 'week' || period === 'fortnight') {
    return date.toLocaleDateString('en-AU', {
      weekday: 'short',
      day: 'numeric',
    })
  }
  return date.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function formatAUD(value: number) {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
  return `$${value}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-3 text-xs flex flex-col gap-1.5">
      <span className="text-[#8b949e] font-medium">{label}</span>
      {payload.map((entry: any) => (
        <span
          key={entry.name}
          style={{ color: entry.color }}
          className="font-semibold capitalize"
        >
          {entry.name}: ${entry.value.toLocaleString('en-AU')}
        </span>
      ))}
    </div>
  )
}

export default function CashflowChart() {
  const { period } = useDashboard()
  const { getToken } = useAuth()

  const apiPeriod = PERIOD_MAP[period] ?? 'month'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-chart', apiPeriod],
    queryFn: () => fetchChart(apiPeriod, getToken),
  })

  const chartData = data?.map(d => ({
    ...d,
    date: formatDate(d.date, apiPeriod),
  }))

  if (isLoading) return <CashflowChartSkeleton />

  if (isError || !data) {
    return (
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5">
        <p className="text-sm text-[#8b949e]">
          Unable to load chart. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-4 md:p-5 flex flex-col gap-4 **:outline-none">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-white">Cashflow Trend</h2>
          <p className="text-xs text-[#8b949e]">Income vs Expenses</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#8b949e]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#00C896] inline-block" />
            Income
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
            Expenses
          </span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart
          data={chartData}
          margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00C896" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#00C896" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#1a2d3d"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            tick={{ fill: '#8b949e', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#8b949e', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={formatAUD}
            width={55}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#00C896"
            strokeWidth={2}
            fill="url(#incomeGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#00C896' }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={2}
            fill="url(#expensesGradient)"
            dot={false}
            activeDot={{ r: 4, fill: '#ef4444' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
