'use client'

import { useState, useRef, useEffect, createElement } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import { getCategoryIcon } from '@/components/ui/categoryIcon'

interface FilterOption {
  label: string
  value: string
  color?: string
  icon?: React.ReactNode
  categoryIcon?: string
}

interface FilterDropdownProps {
  icon: React.ReactNode
  options: FilterOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function FilterDropdown({
  icon,
  options,
  value,
  onChange,
  placeholder,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
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

  const selected = options.find(o => o.value === value)
  const label = selected?.label ?? placeholder ?? 'Select'

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={[
          'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap',
          open || value
            ? 'border-[#00c89666] bg-[#00c8960f] shadow-md'
            : 'border-white/10 text-white bg-[#0f172a] hover:border-[#00C896]/30 hover:text-[#e6edf3]',
        ].join(' ')}
      >
        <span className={open || value ? 'text-[#00C896]' : 'text-[#94a3b8]'}>
          {icon}
        </span>
        {label}
        {open ? (
          <ChevronUp size={14} className="text-[#00C896]" />
        ) : (
          <ChevronDown size={14} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 p-1.5 bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl shadow-xl min-w-56 overflow-hidden max-h-80 overflow-y-auto">
          {options.map(opt => {
            const CategoryIcon = opt.categoryIcon
              ? getCategoryIcon(opt.categoryIcon)
              : null

            return (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value)
                  setOpen(false)
                }}
                className={[
                  'w-full flex items-center justify-between gap-3 px-4 py-3 text-xs transition-colors text-left',
                  opt.value === value
                    ? 'text-[#00c896] bg-[#00c8960f]'
                    : 'text-[#cbd5e1] hover:text-white hover:bg-[#ffffff08]',
                ].join(' ')}
              >
                <span className="flex items-center gap-2.5">
                  {opt.icon ? (
                    opt.icon
                  ) : CategoryIcon && opt.color ? (
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${opt.color}20` }}
                    >
                      {createElement(CategoryIcon, {
                        size: 11,
                        style: { color: opt.color },
                      })}
                    </div>
                  ) : opt.color ? (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: opt.color }}
                    />
                  ) : (
                    icon
                  )}
                  {opt.label}
                </span>
                {opt.value === value && (
                  <Check size={12} className="text-[#00C896]" />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
