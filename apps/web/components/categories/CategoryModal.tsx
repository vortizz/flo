'use client'

import { useState, useMemo, createElement } from 'react'
import { Search, X, Check, Plus } from 'lucide-react'
import type {
  Category,
  CreateUserCategoryData,
  UpdateUserCategoryData,
} from '@/lib/api/categories'
import {
  CATEGORY_ICON_MAP,
  CATEGORY_ICON_NAMES,
} from '@/constants/categoryIcons'
import { createPortal } from 'react-dom'

const PRESET_COLORS = [
  '#00C896',
  '#ef4444',
  '#f97316',
  '#a78bfa',
  '#22d3ee',
  '#ec4899',
  '#8b5cf6',
  '#84cc16',
  '#f59e0b',
  '#60a5fa',
  '#0ea5e9',
  '#6366f1',
  '#f472b6',
  '#34d399',
  '#8b949e',
]

function CategoryPreview({
  name,
  color,
  icon,
}: {
  name: string
  color: string
  icon: string
}) {
  const Icon = CATEGORY_ICON_MAP[icon]

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#07111c] border border-[#1a2d3d]">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}20` }}
      >
        {Icon ? createElement(Icon, { size: 16, style: { color } }) : null}
      </div>
      <span className="text-sm text-white font-medium">
        {name || 'Category name'}
      </span>
    </div>
  )
}

interface CategoryModalProps {
  editCategory?: Category
  defaultType?: 'DEBIT' | 'CREDIT'
  onSave: (
    data: CreateUserCategoryData | UpdateUserCategoryData,
  ) => Promise<void>
  onClose: () => void
}

export default function CategoryModal({
  editCategory,
  defaultType,
  onSave,
  onClose,
}: CategoryModalProps) {
  const isEditing = !!editCategory

  const [name, setName] = useState(editCategory?.name ?? '')
  const [type, setType] = useState<'DEBIT' | 'CREDIT'>(
    editCategory?.type ?? defaultType ?? 'DEBIT',
  )
  const [color, setColor] = useState(editCategory?.color ?? PRESET_COLORS[0])
  const [icon, setIcon] = useState(editCategory?.icon ?? 'ShoppingCart')
  const [iconSearch, setIconSearch] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const filteredIcons = useMemo(() => {
    if (!iconSearch) return CATEGORY_ICON_NAMES
    return CATEGORY_ICON_NAMES.filter(n =>
      n.toLowerCase().includes(iconSearch.toLowerCase()),
    )
  }, [iconSearch])

  const iconGrid = useMemo(
    () =>
      filteredIcons.map(iconName => {
        const Icon = CATEGORY_ICON_MAP[iconName]
        if (!Icon) return null
        const isSelected = icon === iconName
        return (
          <button
            key={iconName}
            onClick={() => setIcon(iconName)}
            title={iconName}
            className={`w-full aspect-square rounded-lg flex items-center justify-center transition-all ${
              !isSelected ? 'hover:bg-white/5' : ''
            }`}
            style={{ backgroundColor: isSelected ? `${color}20` : undefined }}
          >
            {createElement(Icon, {
              size: 15,
              style: { color: isSelected ? color : '#8b949e' },
            })}
          </button>
        )
      }),
    [filteredIcons, icon, color],
  )

  const formValid = name.trim() && color && icon

  const typeAccent = type === 'DEBIT' ? '#ef4444' : '#00C896'

  const hasLinkedTransactions = (editCategory?.transactionCount ?? 0) > 0

  async function handleSave() {
    if (!formValid) return
    setIsSaving(true)
    setError(null)
    try {
      await onSave({ name: name.trim(), type, color, icon })
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-md bg-[#0d1f2d] border border-[#1a2d3d] rounded-2xl shadow-2xl flex flex-col">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${typeAccent}60, transparent)`,
          }}
        />
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 shrink-0">
          <h2 className="text-base font-semibold text-white">
            {isEditing ? 'Edit Category' : 'New Category'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-4.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1a2d3d]">
          {/* Preview */}
          <CategoryPreview name={name} color={color} icon={icon} />

          {/* Name */}
          <div>
            <p className="text-xs font-medium text-[#8b949e] tracking-widest mb-2">
              Name
            </p>
            <input
              type="text"
              placeholder="e.g. Date Night"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-[#07111c] border border-[#1a2d3d] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a6070] focus:outline-none focus:border-[#00C896]/60 transition-colors"
            />
          </div>

          {/* Type */}
          <div>
            <p className="text-xs font-medium text-[#8b949e] tracking-widests mb-2">
              Type
            </p>
            <div className="flex p-1 rounded-xl bg-[#07111c] border border-[#1a2d3d]">
              {(['DEBIT', 'CREDIT'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => !hasLinkedTransactions && setType(t)}
                  disabled={hasLinkedTransactions}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    hasLinkedTransactions
                      ? type === t
                        ? t === 'DEBIT'
                          ? 'bg-red-500/10 text-red-400 border-red-500/40 opacity-50 cursor-not-allowed'
                          : 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/40 opacity-50 cursor-not-allowed'
                        : 'text-[#8b949e] border-transparent opacity-50 cursor-not-allowed'
                      : type === t
                        ? t === 'DEBIT'
                          ? 'bg-red-500/10 text-red-400 border-red-500/40'
                          : 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/40'
                        : 'text-[#8b949e] border-transparent hover:text-white'
                  }`}
                >
                  {t === 'DEBIT' ? 'Expense' : 'Income'}
                </button>
              ))}
            </div>
            {hasLinkedTransactions && (
              <p className="text-xs text-[#8b949e] mt-1.5">
                Type cannot be changed while this category has{' '}
                {editCategory?.transactionCount} linked transaction
                {editCategory?.transactionCount !== 1 ? 's' : ''}.
              </p>
            )}
          </div>

          {/* Color */}
          <div>
            <p className="text-xs font-medium text-[#8b949e] tracking-widest mb-2">
              Color
            </p>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110 shrink-0"
                  style={{ backgroundColor: c }}
                >
                  {color === c && (
                    <Check
                      size={12}
                      className="text-white mx-auto"
                      strokeWidth={3}
                    />
                  )}
                </button>
              ))}
              <label className="w-7 h-7 rounded-full border-2 border-dashed border-[#1a2d3d] flex items-center justify-center cursor-pointer hover:border-[#00C896]/60 transition-colors shrink-0 overflow-hidden relative">
                <span className="text-[#8b949e]">
                  <Plus size={14} />
                </span>
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </label>
            </div>
          </div>

          {/* Icon picker */}
          <div>
            <p className="text-xs font-medium text-[#8b949e] tracking-widest mb-2">
              Icon
            </p>
            <div className="relative mb-2">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]"
              />
              <input
                type="text"
                placeholder="Search icons..."
                value={iconSearch}
                onChange={e => setIconSearch(e.target.value)}
                className="w-full bg-[#07111c] border border-[#1a2d3d] rounded-xl pl-9 pr-4 py-2 text-white text-sm placeholder:text-[#4a6070] focus:outline-none focus:border-[#00C896]/60 transition-colors"
              />
            </div>
            <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto bg-[#07111c] border border-[#1a2d3d] rounded-xl p-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1a2d3d]">
              {filteredIcons.length === 0 ? (
                <div className="col-span-8 flex items-center justify-center py-6">
                  <p className="text-xs text-[#4a6070]">No icons found</p>
                </div>
              ) : (
                iconGrid
              )}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 border-t border-[#1a2d3d] shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-sm font-medium border border-[#1a2d3d] text-[#8b949e] hover:text-white hover:border-[#4a6070] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !formValid}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
                formValid
                  ? 'bg-[#00C896] text-black shadow-[0_4px_20px_rgba(0,200,150,0.25)]'
                  : 'bg-[#00C896]/30 text-[#00C896]/60'
              }`}
            >
              {isSaving
                ? 'Saving...'
                : isEditing
                  ? 'Save Changes'
                  : 'Create Category'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
