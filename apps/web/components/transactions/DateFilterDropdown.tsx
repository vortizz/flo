'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar, ChevronDown, ChevronUp, Check, Clock } from 'lucide-react'
import { type DateRange } from '@/components/dashboard/layout/DashboardContext'
import InlineDatePicker from './InlineDatePicker'

const DATE_OPTIONS = [
  { label: 'Last 7 Days', value: '7' },
  { label: 'Last 30 Days', value: '30' },
  { label: 'Last 90 Days', value: '90' },
]

interface DateFilterDropdownProps {
  days: string
  onDaysChange: (v: string) => void
  customRange: DateRange | undefined
  onCustomRangeChange: (range: DateRange | undefined) => void
}

export default function DateFilterDropdown({
  days,
  onDaysChange,
  customRange,
  onCustomRangeChange,
}: DateFilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const [showCustomPicker, setShowCustomPicker] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setShowCustomPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isCustom = days === 'custom'
  const label =
    isCustom && customRange?.from && customRange?.to
      ? `${customRange.from.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – ${customRange.to.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
      : (DATE_OPTIONS.find(o => o.value === days)?.label ?? 'Last 30 Days')

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={[
          'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap',
          open || isCustom
            ? 'border-[#00C896]/60 bg-[#00C896]/5'
            : 'border-white/10 text-white bg-[#0f172a] hover:border-[#00C896]/30 hover:text-[#e6edf3]',
        ].join(' ')}
      >
        <Calendar
          size={14}
          className={open || isCustom ? 'text-[#00C896]' : 'text-[#94a3b8]'}
        />
        {label}
        {open ? (
          <ChevronUp size={14} className="text-[#00C896]" />
        ) : (
          <ChevronDown size={14} />
        )}
      </button>

      {open && (
        <div
          className={[
            'absolute left-0 top-full mt-2 z-50 p-1.5 bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl shadow-xl overflow-hidden',
            showCustomPicker ? 'w-auto' : 'w-56',
          ].join(' ')}
        >
          {!showCustomPicker ? (
            <>
              {DATE_OPTIONS.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    onDaysChange(opt.value)
                    onCustomRangeChange(undefined)
                    setOpen(false)
                  }}
                  className={[
                    'w-full flex items-center justify-between gap-3 px-4 py-3 text-xs transition-colors text-left',
                    opt.value === days && !isCustom
                      ? 'text-[#00C896] bg-[#00c8960f]'
                      : 'text-[#8b949e] hover:text-white hover:bg-[#ffffff08]',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-2.5">
                    <Clock size={12} />
                    {opt.label}
                  </span>
                  {opt.value === days && !isCustom && (
                    <Check size={12} className="text-[#00C896]" />
                  )}
                </button>
              ))}
              <hr className="border-[#1a2d3d] my-1" />
              <button
                onClick={() => setShowCustomPicker(true)}
                className={[
                  'w-full flex items-center justify-between gap-3 px-4 py-3 text-xs transition-colors text-left',
                  isCustom
                    ? 'text-[#00C896] bg-[#00c8960f]'
                    : 'text-[#8b949e] hover:text-white hover:bg-[#ffffff08]',
                ].join(' ')}
              >
                <span className="flex items-center gap-2.5">
                  <Calendar size={12} />
                  Custom Range
                </span>
                {isCustom && <Check size={12} className="text-[#00C896]" />}
              </button>
            </>
          ) : (
            <InlineDatePicker
              selected={customRange}
              onSelect={range => {
                if (range?.from && range?.to) {
                  onDaysChange('custom')
                  onCustomRangeChange(range)
                  setOpen(false)
                  setShowCustomPicker(false)
                }
              }}
              onBack={() => setShowCustomPicker(false)}
            />
          )}
        </div>
      )}
    </div>
  )
}
