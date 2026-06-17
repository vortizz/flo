'use client'

import { useState } from 'react'
import { X, Check, Loader2 } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import {
  createManualTransaction,
  type ManualTransactionData,
} from '@/lib/api/transactions'
import { fetchCategories } from '@/lib/api/categories'
import SingleDatePicker from '../ui/SingleDatePicker'
import { useQuery } from '@tanstack/react-query'
import CategorySelect from '../ui/CategorySelect'
import CashAvatar from '../ui/CashAvatar'

function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

interface AddTransactionModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddTransactionModal({
  onClose,
  onSuccess,
}: AddTransactionModalProps) {
  const { getToken } = useAuth()

  const [type, setType] = useState<'expense' | 'income'>('expense')
  const [rawAmount, setRawAmount] = useState('')
  const [merchant, setMerchant] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(getToken),
    staleTime: Infinity,
  })

  const isExpense = type === 'expense'
  const typeAccent = isExpense ? '#ef4444' : '#00C896'
  const typeAccentClass = isExpense ? 'text-red-400' : 'text-[#00C896]'
  const categories = isExpense
    ? (categoriesData?.expense ?? [])
    : (categoriesData?.income ?? [])

  function handleTypeChange(t: 'expense' | 'income') {
    setType(t)
    setCategoryId('')
  }

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

  async function handleSubmit() {
    if (!formValid) return
    setIsLoading(true)
    setError(null)

    const data: ManualTransactionData = {
      type: type === 'expense' ? 'DEBIT' : 'CREDIT',
      amount: parsedAmount,
      merchant: merchant.trim(),
      categoryId: categoryId || undefined,
      description: description.trim() || undefined,
      date,
    }

    try {
      await createManualTransaction(data, getToken)
      setSubmitted(true)
      onSuccess()
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 1200)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="relative w-full max-w-md bg-[#0d1f2d] border border-[#1a2d3d] rounded-2xl shadow-2xl">
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{
            background: `linear-gradient(90deg, transparent, ${typeAccent}60, transparent)`,
          }}
        />

        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <CashAvatar size="sm" rounded="lg" />
            <h2 className="text-base font-semibold text-white">
              Add Transaction
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 pb-6 space-y-5">
          {/* Type toggle */}
          <div className="flex p-1 rounded-xl bg-[#07111c] border border-[#1a2d3d]">
            {(['expense', 'income'] as const).map(t => {
              const active = type === t
              const isExp = t === 'expense'
              return (
                <button
                  key={t}
                  onClick={() => handleTypeChange(t)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                    active
                      ? isExp
                        ? 'bg-red-500/10 text-red-400 border-red-500/40'
                        : 'bg-[#00C896]/10 text-[#00C896] border-[#00C896]/40'
                      : 'text-[#8b949e] border-transparent hover:text-white'
                  }`}
                >
                  {t === 'expense' ? 'Expense' : 'Income'}
                </button>
              )
            })}
          </div>

          {/* Amount */}
          <div>
            <p className="text-xs font-medium text-[#8b949e] tracking-widest mb-2">
              Amount
            </p>
            <div
              className={`relative rounded-xl border overflow-hidden bg-[#07111c] transition-all duration-150 ${
                rawAmount && !amountValid
                  ? 'border-[#ef4444]'
                  : 'border-[#1a2d3d]'
              }`}
            >
              <span className="absolute left-0 top-0 bottom-0 flex items-center pl-5 pr-3 text-2xl font-light select-none border-r border-[#1a2d3d] bg-[#040c14] text-[#3a4d5c]">
                $
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={displayAmount}
                onChange={handleAmountChange}
                onKeyDown={handleAmountKey}
                placeholder="0.00"
                className={`w-full pl-16 pr-5 py-5 text-3xl font-semibold text-center outline-none bg-transparent tracking-tight placeholder:text-[#1a2d3d] ${typeAccentClass}`}
                style={{ caretColor: typeAccent }}
              />
            </div>
            {rawAmount && !amountValid && (
              <p className="text-xs mt-1.5 pl-1 text-red-400">
                Maximum amount is $99,999.00
              </p>
            )}
          </div>

          <div className="h-px bg-[#1a2d3d]" />

          {/* Merchant */}
          <div>
            <p className="text-xs font-medium text-[#8b949e] tracking-widest mb-2">
              Merchant
            </p>
            <input
              type="text"
              placeholder="e.g. Woolworths"
              value={merchant}
              onChange={e => setMerchant(e.target.value)}
              className="w-full bg-[#07111c] border border-[#1a2d3d] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a6070] focus:outline-none focus:border-[#00C896]/60 transition-colors"
            />
          </div>

          {/* Category */}
          <div>
            <p className="text-xs font-medium text-[#8b949e] tracking-widest mb-2">
              Category
            </p>
            <CategorySelect
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
            />
          </div>

          {/* Description + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-medium text-[#8b949e] tracking-widest mb-2">
                Description{' '}
                <span className="normal-case font-normal tracking-normal opacity-50">
                  (optional)
                </span>
              </p>
              <input
                type="text"
                placeholder="Add a note…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-[#07111c] border border-[#1a2d3d] rounded-xl px-4 py-3 text-white text-sm placeholder:text-[#4a6070] focus:outline-none focus:border-[#00C896]/60 transition-colors"
              />
            </div>
            <div>
              <p className="text-xs font-medium text-[#8b949e] tracking-widest mb-2">
                Date
              </p>
              <SingleDatePicker value={date} onChange={setDate} />
            </div>
          </div>

          <div className="h-px bg-[#1a2d3d]" />

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-5 py-3 rounded-xl text-sm font-medium border border-[#1a2d3d] text-[#8b949e] hover:text-white hover:border-[#4a6070] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || submitted || !formValid}
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
                  Added!
                </>
              ) : isLoading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving...
                </>
              ) : (
                '+ Manual Transaction'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
