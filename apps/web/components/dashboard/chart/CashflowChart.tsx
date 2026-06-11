'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { useState, useMemo, useRef, useEffect } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  PERIOD_MAP,
  useDashboard,
} from '@/components/dashboard/layout/DashboardContext'
import { fetchChart, fetchChartSummary } from '@/lib/api/dashboard'
import CashflowChartSkeleton from './CashflowChartSkeleton'

type ViewMode = 'detailed' | 'summary'

function getDetailedWindowSize(
  totalDays: number,
  containerWidth: number,
): number {
  const maxByWidth = containerWidth > 0 ? Math.floor(containerWidth / 50) : 14
  if (totalDays <= 14) return Math.min(7, maxByWidth)
  if (totalDays <= 90) return Math.min(14, maxByWidth)
  return Math.min(30, maxByWidth)
}

function getSummaryWindowSize(
  apiPeriod: string,
  containerWidth: number,
): number {
  const maxByWidth = containerWidth > 0 ? Math.floor(containerWidth / 100) : 6
  if (apiPeriod === 'week') return Math.min(4, maxByWidth)
  if (apiPeriod === 'fortnight') return Math.min(4, maxByWidth)
  if (apiPeriod === 'month') return Math.min(6, maxByWidth)
  return Math.min(6, maxByWidth)
}

function formatDetailedDate(
  dateStr: string,
  apiPeriod: string,
  totalDays: number,
) {
  const date = new Date(dateStr)
  if (apiPeriod === 'week' || totalDays <= 7) {
    return date.toLocaleDateString('en-AU', { weekday: 'short' })
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

export default function CashflowChart({ className }: { className?: string }) {
  const { period, customRange } = useDashboard()
  const { getToken } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>('detailed')
  const [offset, setOffset] = useState(0)
  const touchStartX = useRef<number | null>(null)
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    if (!chartContainerRef.current) return
    const observer = new ResizeObserver(entries => {
      setContainerWidth(entries[0].contentRect.width)
    })
    observer.observe(chartContainerRef.current)
    return () => observer.disconnect()
  }, [])

  const apiPeriod = PERIOD_MAP[period] ?? 'week'
  const fromStr = customRange?.from
    ? `${customRange.from.getFullYear()}-${String(customRange.from.getMonth() + 1).padStart(2, '0')}-${String(customRange.from.getDate()).padStart(2, '0')}`
    : undefined

  const toStr = customRange?.to
    ? `${customRange.to.getFullYear()}-${String(customRange.to.getMonth() + 1).padStart(2, '0')}-${String(customRange.to.getDate()).padStart(2, '0')}`
    : undefined

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-chart', apiPeriod, fromStr, toStr],
    queryFn: () => fetchChart(apiPeriod, getToken, fromStr, toStr),
    enabled: apiPeriod !== 'custom' || (!!fromStr && !!toStr),
  })

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-chart-summary', apiPeriod, fromStr, toStr],
    queryFn: () => fetchChartSummary(apiPeriod, getToken, fromStr, toStr),
    enabled: viewMode === 'summary',
  })

  const totalDays = data?.length ?? 0

  const allChartData = useMemo(() => {
    if (viewMode === 'detailed') {
      if (!data) return []
      return data.map(d => ({
        ...d,
        date: formatDetailedDate(d.date, apiPeriod, totalDays),
      }))
    }
    return summaryData ?? []
  }, [data, summaryData, viewMode, apiPeriod, totalDays])

  const windowSize =
    viewMode === 'detailed'
      ? getDetailedWindowSize(totalDays, containerWidth)
      : getSummaryWindowSize(apiPeriod, containerWidth)

  const defaultIndex = Math.max(0, allChartData.length - windowSize)
  const startIndex = Math.max(0, defaultIndex - offset)

  const visibleData = allChartData.slice(startIndex, startIndex + windowSize)
  const canGoLeft = startIndex > 0
  const canGoRight = startIndex + windowSize < allChartData.length
  const showNav = allChartData.length > windowSize
  const totalPositions = Math.max(1, allChartData.length - windowSize + 1)

  function goLeft() {
    setOffset(o => Math.min(o + 1, defaultIndex))
  }

  function goRight() {
    setOffset(o => Math.max(o - 1, 0))
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const diff = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(diff) < 30) return
    if (diff > 0 && canGoRight) goRight()
    if (diff < 0 && canGoLeft) goLeft()
    touchStartX.current = null
  }

  if (isLoading || (viewMode === 'summary' && summaryLoading && !summaryData)) {
    return <CashflowChartSkeleton />
  }

  if (isError || !data) {
    return (
      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 h-full flex items-center justify-center">
        <p className="text-sm text-[#8b949e]">
          Unable to load chart. Please try again.
        </p>
      </div>
    )
  }

  return (
    <div
      className={`bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-4 md:p-5 flex flex-col gap-4 **:outline-none h-full ${className ?? ''}`}
    >
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">Cashflow Trend</h2>
            <p className="text-xs text-[#8b949e]">Income vs Expenses</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Legend — desktop only */}
            <div className="hidden sm:flex items-center gap-3 text-xs text-[#8b949e]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#00C896] inline-block" />
                Income
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
                Expenses
              </span>
            </div>

            {/* Toggle */}
            <div className="flex items-center gap-0.5 bg-[#071828] border border-[#1a2d3d] rounded-lg p-0.5">
              {(['detailed', 'summary'] as ViewMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    setViewMode(mode)
                    setOffset(0)
                  }}
                  className={[
                    'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    viewMode === mode
                      ? 'bg-[#1e293b] text-white border border-[#2a3d4d]'
                      : 'text-[#8b949e] hover:text-white',
                  ].join(' ')}
                >
                  {mode === 'detailed' ? 'Detailed' : 'Summary'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Legend — mobile only */}
        <div className="flex sm:hidden justify-end items-center gap-3 text-xs text-[#8b949e]">
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

      <div
        ref={chartContainerRef}
        className="flex-1 min-h-55"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={visibleData}
            margin={{ top: 4, right: 24, left: 0, bottom: 0 }}
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
              padding={{ right: 12 }}
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

      {showNav && (
        <div className="flex items-center justify-between px-1">
          <button
            onClick={goLeft}
            disabled={!canGoLeft}
            className="w-7 h-7 rounded-full border border-[#1a2d3d] flex items-center justify-center text-[#8b949e] hover:text-white hover:border-[#00C896] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={14} />
          </button>

          {totalPositions <= 10 ? (
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPositions }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setOffset(defaultIndex - i)}
                  className={[
                    'rounded-full transition-all',
                    i === startIndex
                      ? 'w-3 h-1.5 bg-[#00C896]'
                      : 'w-1.5 h-1.5 bg-[#1a2d3d] hover:bg-[#8b949e]',
                  ].join(' ')}
                />
              ))}
            </div>
          ) : (
            <div className="flex-1 mx-4 flex items-center gap-2">
              <span className="text-xs text-[#8b949e] shrink-0">
                {startIndex + 1} / {totalPositions}
              </span>
              <div className="flex-1 h-1 bg-[#1a2d3d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#00C896] rounded-full transition-all"
                  style={{
                    width: `${((startIndex + 1) / totalPositions) * 100}%`,
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={goRight}
            disabled={!canGoRight}
            className="w-7 h-7 rounded-full border border-[#1a2d3d] flex items-center justify-center text-[#8b949e] hover:text-white hover:border-[#00C896] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}
