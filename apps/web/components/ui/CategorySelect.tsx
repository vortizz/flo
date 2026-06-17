'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { Category } from '@/lib/api/categories'

export default function CategorySelect({
  categories,
  value,
  onChange,
  dropdownDirection = 'down',
  size = 'md',
}: {
  categories: Category[]
  value: string
  onChange: (id: string) => void
  dropdownDirection?: 'up' | 'down'
  size?: 'sm' | 'md'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = categories.find(c => c.id === value)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between rounded-xl border text-sm text-left outline-none transition-colors bg-[#07111c] ${
          size === 'md' ? 'px-4 py-3' : 'px-3 py-2'
        } ${open ? 'border-[#00C896]/60' : 'border-[#1a2d3d]'} ${
          value ? 'text-white' : 'text-[#4a6070]'
        }`}
      >
        <span className="flex items-center gap-2">
          {selected && (
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: selected.color }}
            />
          )}
          {selected?.name || 'Select a category'}
        </span>
        <ChevronDown
          size={13}
          className={`text-[#8b949e] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 left-0 right-0 rounded-xl border border-[#1a2d3d] py-1 shadow-2xl overflow-hidden bg-[#0d1f2d] ${
            dropdownDirection === 'up'
              ? 'bottom-full mb-1.5'
              : 'top-full mt-1.5'
          }`}
        >
          <div className="max-h-44 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1a2d3d]">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onChange(cat.id)
                  setOpen(false)
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                  value === cat.id
                    ? 'text-white bg-[#00C896]/5'
                    : 'text-[#8b949e] hover:bg-white/3 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-2.5">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name}
                </span>
                {value === cat.id && (
                  <Check size={13} className="text-[#00C896]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
