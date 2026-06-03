'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useDashboard } from '@/components/dashboard/layout/DashboardContext'
import { fetchCategories } from '@/lib/api/dashboard'
import CategoryChartSkeleton from './CategoryChartSkeleton'

const PERIOD_MAP = {
  'This Week': 'week',
  'This Fortnight': 'fortnight',
  'This Month': 'month',
  Custom: 'month',
} as const

const COLORS = [
  '#00C896',
  '#3b82f6',
  '#a855f7',
  '#f97316',
  '#ec4899',
  '#8b949e',
]

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(amount)
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const { category, amount, percentage } = payload[0].payload
  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-3 text-xs flex flex-col gap-1">
      <span className="text-white font-semibold">{category}</span>
      <span className="text-[#8b949e]">{formatAUD(amount)}</span>
      <span className="text-[#8b949e]">{percentage}%</span>
    </div>
  )
}

export default function CategoryChart() {
  const { period } = useDashboard()
  const { getToken } = useAuth()

  const apiPeriod = PERIOD_MAP[period] ?? 'month'

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-categories', apiPeriod],
    queryFn: () => fetchCategories(apiPeriod, getToken),
  })

  if (isLoading) return <CategoryChartSkeleton />

  if (isError || !data || data.length === 0) {
    return (
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex items-center justify-center h-48">
        <p className="text-sm text-[#8b949e]">
          No spending data for this period.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold text-white">
          Spending by Category
        </h2>
        <p className="text-xs text-[#8b949e]">Top categories this period</p>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-1">
        <div className="w-full md:w-64 h-64 shrink-0 **:outline-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="80%"
                dataKey="amount"
                paddingAngle={3}
                strokeWidth={0}
              >
                {data.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />

              {/* Center label moved HERE so it renders on top of the Pie layer */}
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                fontSize={14}
                fontWeight={700}
              >
                {formatAUD(data.reduce((sum, d) => sum + d.amount, 0))}
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-col gap-2.5 w-full min-w-0 overflow-hidden">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 min-w-0"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <span
                  className="flex-none w-2 h-2 rounded-full"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                <span
                  className="text-xs text-[#8b949e] truncate"
                  title={item.category}
                >
                  {item.category}
                </span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="w-20 h-1.5 rounded-full bg-[#1a2d3d]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: COLORS[index % COLORS.length],
                      width: `${item.percentage}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-white font-medium text-right w-16">
                  {formatAUD(item.amount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
