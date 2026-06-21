'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, Loader2, Check } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import {
  type Transaction,
  type ManualTransactionData,
} from '@/lib/api/transactions'
import {
  fetchCategories,
  createUserCategory,
  updateUserCategory,
  type Category,
  type CreateUserCategoryData,
  type UpdateUserCategoryData,
} from '@/lib/api/categories'
import SingleDatePicker from '../../ui/SingleDatePicker'
import CategorySelect from '@/components/ui/CategorySelect'
import CashAvatar from '@/components/ui/CashAvatar'
import CategoryModal from '@/components/categories/CategoryModal'

export default function EditMode({
  tx,
  onSave,
  onCancel,
}: {
  tx: Transaction
  onSave: (data: ManualTransactionData) => Promise<void>
  onCancel: () => void
}) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(getToken),
    staleTime: Infinity,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [type, setType] = useState<'expense' | 'income'>(
    tx.type === 'CREDIT' ? 'income' : 'expense',
  )
  const [rawAmount, setRawAmount] = useState(
    String(Math.round(tx.amount * 100)),
  )
  const [merchant, setMerchant] = useState(tx.merchant)
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const [description, setDescription] = useState(tx.description ?? '')
  const [date, setDate] = useState(tx.date.slice(0, 10))

  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const isExpense = type === 'expense'

  const categories = isExpense
    ? (categoriesData?.expense ?? [])
    : (categoriesData?.income ?? [])

  const resolvedDefault = tx.categoryId ?? ''
  const categoryId =
    selectedCategoryId !== null ? selectedCategoryId : resolvedDefault

  const displayAmount = (() => {
    if (!rawAmount) return ''
    const num = parseInt(rawAmount, 10)
    const dollars = Math.floor(num / 100)
    const cents = num % 100
    return `${dollars.toLocaleString('en-AU')}.${String(cents).padStart(2, '0')}`
  })()

  const parsedAmount = rawAmount ? parseInt(rawAmount, 10) / 100 : 0
  const amountValid = parsedAmount > 0 && parsedAmount <= 99999
  const formValid = amountValid && merchant.trim() && categoryId

  function handleAmountKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (
      !/[\d]/.test(e.key) &&
      !['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)
    ) {
      e.preventDefault()
    }
  }

  function handleAmountChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 7)
    setRawAmount(digits)
  }

  function handleTypeChange(t: 'expense' | 'income') {
    setType(t)
    setSelectedCategoryId('')
  }

  async function handleCategorySave(
    data: CreateUserCategoryData | UpdateUserCategoryData,
  ) {
    if (editingCategory) {
      await updateUserCategory(editingCategory.id, data, getToken)
    } else {
      const created = await createUserCategory(
        data as CreateUserCategoryData,
        getToken,
      )
      setSelectedCategoryId(created.id)
    }
    await queryClient.invalidateQueries({ queryKey: ['categories'] })
    setEditingCategory(null)
    setShowCategoryModal(false)
  }

  async function handleSave() {
    if (!formValid) return
    setIsSaving(true)
    setError(null)
    try {
      await onSave({
        type: type === 'expense' ? 'DEBIT' : 'CREDIT',
        amount: parsedAmount,
        merchant: merchant.trim(),
        categoryId: categoryId || undefined,
        description: description.trim() || undefined,
        date,
      })
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        onCancel()
      }, 1200)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
        <h2 className="text-lg font-semibold text-white">Edit Transaction</h2>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1a2d3d]">
        <div className="px-6 py-6 space-y-4">
          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Merchant
            </div>
            <input
              type="text"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              className="w-full bg-[#07111c] border border-[#1a2d3d] rounded-xl px-3 py-2 text-white text-sm placeholder:text-[#4a6070] focus:outline-none focus:border-[#00C896]/60 transition-colors"
            />
          </div>

          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Amount
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#4a6070]">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                onKeyDown={handleAmountKey}
                placeholder="0.00"
                className={`w-full bg-[#07111c] border border-[#1a2d3d] rounded-xl pl-7 pr-14 py-2 text-sm focus:outline-none focus:border-[#00C896]/60 transition-colors ${
                  isExpense ? 'text-red-400' : 'text-[#00C896]'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#4a6070]">
                AUD
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Type
            </div>
            <div className="flex gap-2">
              {(['expense', 'income'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${
                    type === t
                      ? t === 'expense'
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/30'
                      : 'text-[#8b949e] border-[#1a2d3d] hover:text-white'
                  }`}
                >
                  {t === 'expense' ? 'Expense' : 'Income'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Date
            </div>
            <SingleDatePicker value={date} onChange={setDate} size="sm" />
          </div>

          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Category
            </div>
            <CategorySelect
              categories={categories}
              value={categoryId}
              onChange={setSelectedCategoryId}
              onCreateCategory={() => {
                setEditingCategory(null)
                setShowCategoryModal(true)
              }}
              onEditCategory={cat => {
                setEditingCategory(cat)
                setShowCategoryModal(true)
              }}
              size="sm"
            />
          </div>

          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Account
            </div>
            <div className="w-full p-3 rounded-xl border border-white/5 bg-[#1e293b4d] flex justify-between items-center text-sm text-white">
              <div className="flex gap-3 items-center">
                {tx.logoUrl ? (
                  <Image
                    src={tx.logoUrl}
                    alt={tx.account}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : tx.isCash ? (
                  <CashAvatar size="md" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#1a2d3d] flex items-center justify-center">
                    <span className="text-xs font-bold text-[#8b949e]">
                      {tx.account.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <p className="text-sm text-white">{tx.account}</p>
                  {tx.last4 && (
                    <p className="text-[#8b949e] text-xs">••• {tx.last4}</p>
                  )}
                </div>
              </div>
              <div className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#1a2d3d] text-[#8b949e]">
                Read-only
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs font-medium text-[#8b949e] tracking-wide mb-1.5">
              Note
            </div>
            <input
              type="text"
              placeholder="Add a note…"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#07111c] border border-[#1a2d3d] rounded-xl px-3 py-2 text-white text-sm placeholder:text-[#4a6070] focus:outline-none focus:border-[#00C896]/60 transition-colors"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      </div>

      <div className="px-6 py-5 border-t border-[#1a2d3d] shrink-0">
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-[#1a2d3d] text-[#8b949e] hover:text-white text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || submitted || !formValid}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed ${
              submitted
                ? 'bg-[#00C896]/20 text-[#00C896]'
                : formValid
                  ? 'bg-[#00C896] text-black shadow-[0_4px_20px_rgba(0,200,150,0.25)]'
                  : 'bg-[#00C896]/15 text-[#00C896]/40'
            }`}
          >
            {submitted ? (
              <>
                <Check size={15} strokeWidth={2.5} />
                Saved!
              </>
            ) : isSaving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>

      {showCategoryModal && (
        <CategoryModal
          editCategory={editingCategory ?? undefined}
          defaultType={type === 'expense' ? 'DEBIT' : 'CREDIT'}
          onSave={handleCategorySave}
          onClose={() => {
            setShowCategoryModal(false)
            setEditingCategory(null)
          }}
        />
      )}
    </>
  )
}
