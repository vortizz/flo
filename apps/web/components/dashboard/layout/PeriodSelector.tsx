'use client'

import { useDashboard, VALID_PERIODS, type Period } from './DashboardContext'
import CustomDatePicker from './CustomDatePicker'

const PERIOD_LABELS: Record<Period, { full: string; short: string }> = {
  'This Week': { full: 'This Week', short: 'Week' },
  'This Fortnight': { full: 'This Fortnight', short: 'Fortnight' },
  'This Month': { full: 'This Month', short: 'Month' },
  Custom: { full: 'Custom', short: 'Custom' },
}

export default function PeriodSelector() {
  const { period, setPeriod, customRange, setCustomRange } = useDashboard()

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-around w-full bg-[#111c2a] border border-[#1a2d3d] rounded-lg p-1">
        {VALID_PERIODS.map(opt =>
          opt === 'Custom' ? (
            <CustomDatePicker
              key={opt}
              selected={customRange}
              onSelect={range => setCustomRange(range)}
            />
          ) : (
            <button
              key={opt}
              onClick={() => setPeriod(opt)}
              className={[
                'flex items-center px-2 sm:px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all',
                period === opt
                  ? 'bg-[#1e293b] text-[#e6edf3] shadow-sm border border-[#1a2d3d]'
                  : 'text-[#8b949e] border border-transparent hover:text-[#e6edf3]',
              ].join(' ')}
            >
              <span className="sm:hidden">{PERIOD_LABELS[opt].short}</span>
              <span className="hidden sm:inline">
                {PERIOD_LABELS[opt].full}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  )
}
