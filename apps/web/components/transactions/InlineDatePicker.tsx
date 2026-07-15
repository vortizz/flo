'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, ArrowLeft } from 'lucide-react'
import { type DateRange } from '@/components/dashboard/layout/DashboardContext'

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number) {
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
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

interface InlineDatePickerProps {
  selected: DateRange | undefined
  onSelect: (range: DateRange) => void
  onBack: () => void
}

export default function InlineDatePicker({
  selected,
  onSelect,
  onBack,
}: InlineDatePickerProps) {
  const [localRange, setLocalRange] = useState<DateRange>(
    selected ?? { from: undefined, to: undefined },
  )
  const [viewYear, setViewYear] = useState(new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(new Date().getMonth())

  const today = new Date()
  const todayUTC = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  )

  function handleDayClick(date: Date) {
    if (!localRange.from || (localRange.from && localRange.to)) {
      setLocalRange({ from: date, to: undefined })
    } else {
      if (date < localRange.from) {
        setLocalRange({ from: date, to: localRange.from })
      } else {
        setLocalRange({ from: localRange.from, to: date })
      }
    }
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

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="p-4 flex flex-col gap-3 w-72">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs text-[#8b949e] hover:text-white transition-colors"
      >
        <ArrowLeft size={12} />
        Back
      </button>

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevMonth}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#1a2d3d] transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-sm font-semibold text-white">{monthName}</span>
        <button
          onClick={nextMonth}
          className="w-7 h-7 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#1a2d3d] transition-colors"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Weekdays */}
      <div className="grid grid-cols-7">
        {WEEKDAYS.map(d => (
          <div
            key={d}
            className="h-7 flex items-center justify-center text-[10px] font-medium text-[#8b949e]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Days */}
      <div className="grid grid-cols-7 gap-0.5">
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`e-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1
          const date = new Date(Date.UTC(viewYear, viewMonth, day))
          const isFrom = localRange.from && isSameDay(date, localRange.from)
          const isTo = localRange.to && isSameDay(date, localRange.to)
          const inRange =
            localRange.from &&
            localRange.to &&
            isInRange(date, localRange.from, localRange.to)
          const isToday = isSameDay(date, todayUTC)
          const isFuture = date > todayUTC

          return (
            <button
              key={day}
              onClick={() => !isFuture && handleDayClick(date)}
              disabled={isFuture}
              className={[
                'h-7 flex items-center justify-center text-xs transition-colors',
                isFuture
                  ? 'text-[#8b949e]/20 cursor-not-allowed'
                  : 'cursor-pointer',
                isFrom || isTo
                  ? 'bg-[#00C896] text-[#040e1a] font-bold rounded-md'
                  : '',
                inRange && !isFrom && !isTo
                  ? 'bg-[#00C896]/10 text-[#00C896]'
                  : '',
                !isFrom && !isTo && !inRange && !isFuture
                  ? 'text-[#e6edf3] hover:bg-[#1a2d3d] rounded-md'
                  : '',
                isToday && !isFrom && !isTo ? 'font-bold text-[#00C896]' : '',
              ].join(' ')}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className="text-center text-xs text-[#8b949e]">
        {localRange.from && localRange.to
          ? `${diffDays(localRange.from, localRange.to)} days selected`
          : 'No range selected'}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            setLocalRange({ from: undefined, to: undefined })
          }}
          className="text-xs text-[#8b949e] hover:text-white transition-colors border hover:border-[#1a2d3d] rounded-lg px-3 py-2"
        >
          Clear
        </button>
        <div className="flex items-center gap-3">
          {localRange.from && localRange.to && (
            <span className="text-xs text-[#00C896]">
              {/* {diffDays(localRange.from, localRange.to)} days ·{' '} */}
              {formatDate(localRange.from)} – {formatDate(localRange.to)}
            </span>
          )}
        </div>
        <button
          onClick={() =>
            localRange.from &&
            localRange.to &&
            onSelect(localRange as DateRange)
          }
          disabled={!localRange.from || !localRange.to}
          className="px-3 py-1.5 rounded-md bg-[#00C896] text-[#040e1a] text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Apply
        </button>
      </div>
    </div>
  )
}
