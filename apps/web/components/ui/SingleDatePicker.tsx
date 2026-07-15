'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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

function toISO(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

interface SingleDatePickerProps {
  value: string
  onChange: (date: string) => void
  size?: 'sm' | 'md'
}

export default function SingleDatePicker({
  value,
  onChange,
  size = 'md',
}: SingleDatePickerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const selected = value
    ? new Date(
        Date.UTC(
          parseInt(value.split('-')[0]),
          parseInt(value.split('-')[1]) - 1,
          parseInt(value.split('-')[2]),
        ),
      )
    : null

  const [viewYear, setViewYear] = useState(
    selected ? selected.getUTCFullYear() : new Date().getFullYear(),
  )
  const [viewMonth, setViewMonth] = useState(
    selected ? selected.getUTCMonth() : new Date().getMonth(),
  )

  const today = new Date()
  const todayUTC = new Date(
    Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
  )

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

  function handleDayClick(date: Date) {
    onChange(toISO(date))
    setOpen(false)
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth)
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth)
  const monthName = new Date(viewYear, viewMonth).toLocaleDateString('en-AU', {
    month: 'long',
    year: 'numeric',
  })

  const displayValue = selected
    ? selected.toLocaleDateString('en-AU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'Select a date'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={`w-full flex items-center justify-between rounded-xl border text-sm text-left outline-none transition-colors bg-[#07111c] ${
          size === 'md' ? 'px-4 py-3' : 'px-3 py-2'
        } ${open ? 'border-[#00C896]' : 'border-[#1a2d3d]'} ${
          selected ? 'text-white' : 'text-[#4a6070]'
        }`}
      >
        {displayValue}
        <ChevronLeft
          size={14}
          className={`text-[#8b949e] transition-transform duration-200 ${open ? 'rotate-90' : '-rotate-90'}`}
        />
      </button>

      {open && (
        <div className="absolute z-50 left-0 right-0 bottom-full mb-1.5 rounded-xl border border-[#1a2d3d] shadow-2xl overflow-hidden bg-[#0d1f2d]">
          <div className="p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#1a2d3d] transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="text-sm font-semibold text-white">
                {monthName}
              </span>
              <button
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#1a2d3d] transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>

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

            <div className="grid grid-cols-7 gap-0.5">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`e-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const date = new Date(Date.UTC(viewYear, viewMonth, day))
                const isSelected = selected && isSameDay(date, selected)
                const isToday = isSameDay(date, todayUTC)
                const isFuture = date > todayUTC

                return (
                  <button
                    key={day}
                    onClick={() => !isFuture && handleDayClick(date)}
                    disabled={isFuture}
                    className={[
                      'h-7 flex items-center justify-center text-xs transition-colors rounded-md',
                      isFuture
                        ? 'text-[#8b949e]/20 cursor-not-allowed'
                        : 'cursor-pointer',
                      isSelected ? 'bg-[#00C896] text-[#040e1a] font-bold' : '',
                      !isSelected && !isFuture
                        ? 'text-[#e6edf3] hover:bg-[#1a2d3d]'
                        : '',
                      isToday && !isSelected ? 'font-bold text-[#00C896]' : '',
                    ].join(' ')}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
