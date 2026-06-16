export const EXPENSE_CATEGORIES = [
  { label: 'Groceries', color: 'bg-[#00C896]' },
  { label: 'Food & Dining', color: 'bg-orange-500' },
  { label: 'Transport', color: 'bg-violet-400' },
  { label: 'Housing', color: 'bg-cyan-500' },
  { label: 'Shopping', color: 'bg-pink-500' },
  { label: 'Entertainment', color: 'bg-violet-500' },
  { label: 'Health', color: 'bg-lime-500' },
  { label: 'Utilities', color: 'bg-amber-500' },
  { label: 'Petrol', color: 'bg-orange-400' },
  { label: 'Other', color: 'bg-slate-500' },
]

export const INCOME_CATEGORIES = [
  { label: 'Salary', color: 'bg-[#00C896]' },
  { label: 'Freelance', color: 'bg-blue-500' },
  { label: 'Interest', color: 'bg-violet-400' },
  { label: 'Refund', color: 'bg-cyan-500' },
  { label: 'Gift', color: 'bg-pink-500' },
  { label: 'Other', color: 'bg-slate-500' },
]

export type Mode = 'view' | 'edit' | 'delete'

export function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string, isManual: boolean) {
  const date = new Date(dateStr)
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-AU')
  const yesterdayStr = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 1,
  ).toLocaleDateString('en-AU')
  const dateLocalStr = date.toLocaleDateString('en-AU')

  const timeStr = date.toLocaleTimeString('en-AU', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
  const fullDate = date.toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (isManual) {
    if (dateLocalStr === todayStr) return 'Today'
    if (dateLocalStr === yesterdayStr) return 'Yesterday'
    return fullDate
  }

  if (dateLocalStr === todayStr) return `Today, ${timeStr}`
  if (dateLocalStr === yesterdayStr) return `Yesterday, ${timeStr}`
  return `${fullDate}, ${timeStr}`
}
