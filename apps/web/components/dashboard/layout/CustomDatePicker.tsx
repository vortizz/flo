'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { DateRange } from './DashboardContext'

interface CustomDatePickerProps {
  selected: DateRange | undefined
  onSelect: (range: DateRange | undefined) => void
}

const MAX_DAYS = 365

const QUICK_SELECTS = [
  { label: 'Last 7d', days: 7 },
  { label: 'Last 30d', days: 30 },
  { label: 'Last 90d', days: 90 },
  { label: 'This Month', days: 0, type: 'thisMonth' },
  { label: 'Last Month', days: 0, type: 'lastMonth' },
  { label: 'YTD', days: 0, type: 'ytd' },
]

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function localToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function getQuickRange(opt: (typeof QUICK_SELECTS)[number]): DateRange {
  const today = localToday()

  if (opt.type === 'thisMonth') {
    return {
      from: new Date(today.getFullYear(), today.getMonth(), 1),
      to: today,
    }
  }
  if (opt.type === 'lastMonth') {
    return {
      from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
      to: new Date(today.getFullYear(), today.getMonth(), 0),
    }
  }
  if (opt.type === 'ytd') {
    return {
      from: new Date(today.getFullYear(), 0, 1),
      to: today,
    }
  }

  const from = new Date(today)
  from.setDate(today.getDate() - opt.days + 1)
  return { from, to: today }
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isInRange(date: Date, from: Date, to: Date) {
  return date > from && date < to
}

function formatDate(d: Date) {
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })
}

function diffDays(from: Date, to: Date) {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export default function CustomDatePicker({
  selected,
  onSelect,
}: CustomDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [localRange, setLocalRange] = useState<DateRange>({
    from: undefined,
    to: undefined,
  })
  const [rangeError, setRangeError] = useState<string | undefined>()
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleOpen() {
    setLocalRange(selected ?? { from: undefined, to: undefined })
    setRangeError(undefined)
    setOpen(v => !v)
  }

  function handleDayClick(date: Date) {
    setRangeError(undefined)

    if (!localRange.from || (localRange.from && localRange.to)) {
      setLocalRange({ from: date, to: undefined })
    } else {
      const from = date < localRange.from ? date : localRange.from
      const to = date < localRange.from ? localRange.from : date
      const days = diffDays(from, to)
      if (days > MAX_DAYS) {
        setRangeError(`Max range is ${MAX_DAYS} days`)
        return
      }
      setLocalRange({ from, to })
    }
  }

  function handleQuickSelect(opt: (typeof QUICK_SELECTS)[number]) {
    setRangeError(undefined)
    setLocalRange(getQuickRange(opt))
  }

  function handleApply() {
    if (localRange.from && localRange.to) {
      onSelect(localRange)
      setOpen(false)
    }
  }

  function handleClear() {
    setLocalRange({ from: undefined, to: undefined })
    setRangeError(undefined)
    onSelect(undefined)
  }

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear(y => y - 1)
    } else setViewMonth(m => m - 1)
  }

  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear(y => y + 1)
    } else setViewMonth(m => m + 1)
  }

  const label =
    selected?.from && selected?.to
      ? `${formatDate(selected.from)} – ${formatDate(selected.to)}`
      : 'Pick a range'

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const today = localToday()

  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className={[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all',
          open || (selected?.from && selected?.to)
            ? 'bg-[#1e293b] text-[#e6edf3] shadow-sm border border-[#1a2d3d]'
            : 'text-[#8b949e] border border-transparent hover:text-[#e6edf3]',
        ].join(' ')}
      >
        {label}
        <Calendar size={13} className="shrink-0" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-50 bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl shadow-xl w-86 p-4 flex flex-col gap-4">
          {/* Quick select */}
          <div className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-widest mb-2.5 text-[#8b949e]">
              Quick Select
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_SELECTS.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => handleQuickSelect(opt)}
                  className="px-2.5 py-1 rounded-lg text-xs text-[#8b949e] border border-transparent hover:bg-[#ffffff0a] hover:text-[#f8fafc] hover:border-[#1a2d3d] transition-colors"
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <div className="flex flex-col gap-2 border-t border-[#1a2d3d] pt-4">
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="w-8 h-8 flex items-center justify-center rounded-md text-[#8b949e] border border-[#1a2d3d] hover:text-white hover:border-[#00C8964C] transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-semibold text-white">
                {monthName}
              </span>
              <button
                onClick={nextMonth}
                className="w-8 h-8 flex items-center justify-center rounded-md text-[#8b949e] border border-[#1a2d3d] hover:text-white hover:border-[#00C8964C] transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map(d => (
                <div
                  key={d}
                  className="text-center text-[11px] font-medium py-1 text-[#8b949e]"
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = new Date(viewYear, viewMonth, day)
                const isFrom =
                  localRange.from && isSameDay(date, localRange.from)
                const isTo = localRange.to && isSameDay(date, localRange.to)
                const inRange =
                  localRange.from &&
                  localRange.to &&
                  isInRange(date, localRange.from, localRange.to)
                const isToday = isSameDay(date, today)
                const isFuture = date > today

                return (
                  <button
                    key={day}
                    onClick={() => !isFuture && handleDayClick(date)}
                    disabled={isFuture}
                    className={[
                      'h-9 flex items-center justify-center text-xs transition-colors relative',
                      isFuture
                        ? 'text-[#8b949e]/20 cursor-not-allowed'
                        : 'cursor-pointer',
                      isFrom || isTo
                        ? 'bg-[#00C896] text-[#040e1a] font-bold rounded-md z-10'
                        : '',
                      inRange && !isFrom && !isTo
                        ? 'bg-[#00C896]/10 text-[#00C896] rounded-none'
                        : '',
                      !isFrom && !isTo && !inRange && !isFuture
                        ? 'text-[#e6edf3] hover:bg-[#1a2d3d] rounded-md'
                        : '',
                      isToday && !isFrom && !isTo
                        ? 'font-bold text-[#00C896]'
                        : '',
                    ].join(' ')}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="text-center text-xs text-[#8b949e]">
            {rangeError ? (
              <span className="text-red-400">{rangeError}</span>
            ) : localRange.from && localRange.to ? (
              `${diffDays(localRange.from, localRange.to)} days selected`
            ) : (
              'No range selected'
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleClear}
              className="text-xs text-[#8b949e] hover:text-white transition-colors border hover:border-[#1a2d3d] rounded-lg px-3 py-2"
            >
              Clear
            </button>
            <div className="flex items-center gap-3">
              {localRange.from && localRange.to && (
                <span className="text-xs text-[#00C896]">
                  {formatDate(localRange.from)} – {formatDate(localRange.to)}
                </span>
              )}
            </div>
            <button
              onClick={handleApply}
              disabled={!localRange.from || !localRange.to}
              className="px-4 py-2 rounded-md bg-[#00C896] text-[#040e1a] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
