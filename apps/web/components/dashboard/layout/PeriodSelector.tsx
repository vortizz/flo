'use client'

import { Calendar, ChevronDown } from 'lucide-react'
import { useDashboard, type Period } from './DashboardContext'

const PERIODS: Period[] = ['This Month', 'Last Month', 'YTD', 'Custom']

export default function PeriodSelector() {
  const { period, setPeriod } = useDashboard()

  return (
    <>
      {/* Mobile: native select dropdown */}
      <div className="relative sm:hidden">
        <select
          value={period}
          onChange={e => setPeriod(e.target.value as Period)}
          className="appearance-none w-full bg-[#111c2a] border border-[#1a2d3d] rounded-lg pl-3 pr-8 py-2 text-sm font-medium text-[#e6edf3] focus:outline-none focus:border-[#00C896]/40 transition-colors cursor-pointer"
        >
          {PERIODS.map(opt => (
            <option key={opt} value={opt} className="bg-[#111c2a]">
              {opt}
            </option>
          ))}
        </select>
        <ChevronDown
          size={14}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8b949e]"
        />
      </div>

      {/* Tablet / Desktop: segmented tab buttons */}
      <div className="hidden sm:flex items-center bg-[#111c2a] border border-[#1a2d3d] rounded-lg p-1">
        {PERIODS.map(opt => (
          <button
            key={opt}
            onClick={() => setPeriod(opt)}
            className={[
              'flex items-center px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all',
              period === opt
                ? 'bg-[#1e293b] text-[#e6edf3] shadow-sm border border-[#1a2d3d]'
                : 'text-[#8b949e] border border-transparent hover:text-[#e6edf3]',
            ].join(' ')}
          >
            {opt}
            {opt === 'Custom' && (
              <Calendar size={13} className="ml-1 shrink-0" />
            )}
          </button>
        ))}
      </div>
    </>
  )
}
