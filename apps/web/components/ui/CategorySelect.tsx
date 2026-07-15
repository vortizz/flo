'use client'

import { useState, useRef, useEffect, createElement } from 'react'
import { ChevronDown, Check, Plus, Pencil } from 'lucide-react'
import type { Category } from '@/lib/api/categories'
import { getCategoryIcon } from '@/components/ui/categoryIcon'

export default function CategorySelect({
  categories,
  value,
  onChange,
  onCreateCategory,
  onEditCategory,
  dropdownDirection = 'down',
  size = 'md',
}: {
  categories: Category[]
  value: string
  onChange: (id: string) => void
  onCreateCategory?: () => void
  onEditCategory?: (category: Category) => void
  dropdownDirection?: 'up' | 'down'
  size?: 'sm' | 'md'
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = categories.find(c => c.id === value)

  const userCategories = categories.filter(c => c.userId)
  const systemCategories = categories.filter(c => !c.userId)

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  function renderCategory(cat: Category) {
    const Icon = getCategoryIcon(cat.icon)
    const isSelected = value === cat.id

    return (
      <div
        key={cat.id}
        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors ${
          isSelected
            ? 'text-white bg-[#00C896]/5'
            : 'text-[#8b949e] hover:bg-white/3 hover:text-white'
        }`}
      >
        <button
          className="flex items-center gap-2.5 flex-1 text-left"
          onClick={() => {
            onChange(cat.id)
            setOpen(false)
          }}
        >
          <div
            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${cat.color}20` }}
          >
            {Icon ? (
              createElement(Icon, { size: 11, style: { color: cat.color } })
            ) : (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: cat.color }}
              />
            )}
          </div>
          {cat.name}
        </button>
        <div className="flex items-center gap-1 shrink-0">
          {isSelected && <Check size={13} className="text-[#00C896]" />}
          {cat.userId && onEditCategory && (
            <button
              onClick={e => {
                e.stopPropagation()
                onEditCategory(cat)
                setOpen(false)
              }}
              className="w-5 h-5 flex items-center justify-center rounded text-[#8b949e] hover:text-white hover:bg-white/10 transition-colors ml-1"
            >
              <Pencil size={11} />
            </button>
          )}
        </div>
      </div>
    )
  }

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
          {selected &&
            (() => {
              const Icon = getCategoryIcon(selected.icon)
              return (
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${selected.color}20` }}
                >
                  {Icon ? (
                    createElement(Icon, {
                      size: 11,
                      style: { color: selected.color },
                    })
                  ) : (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ backgroundColor: selected.color }}
                    />
                  )}
                </div>
              )
            })()}
          {selected?.name || 'Select a category'}
        </span>
        <ChevronDown
          size={13}
          className={`text-[#8b949e] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          className={`absolute z-50 left-0 right-0 rounded-xl border border-[#1a2d3d] shadow-2xl overflow-hidden bg-[#0d1f2d] ${
            dropdownDirection === 'up'
              ? 'bottom-full mb-1.5'
              : 'top-full mt-1.5'
          }`}
        >
          <div className="max-h-41 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1a2d3d]">
            {/* User categories */}
            {userCategories.length > 0 && (
              <>
                <div className="px-4 py-2 text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
                  My Categories
                </div>
                {userCategories.map(cat => renderCategory(cat))}
                <div className="mx-4 my-1 h-px bg-[#1a2d3d]" />
              </>
            )}

            {/* System categories */}
            <div className="px-4 py-2 text-[10px] font-semibold text-[#8b949e] uppercase tracking-widest">
              System
            </div>
            {systemCategories.map(cat => renderCategory(cat))}
          </div>

          {/* New category button */}
          {onCreateCategory && (
            <>
              <div className="h-px bg-[#1a2d3d]" />
              <button
                onClick={() => {
                  onCreateCategory()
                  setOpen(false)
                }}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#00C896] hover:bg-[#00C896]/5 transition-colors"
              >
                <Plus size={14} />
                New Category
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
