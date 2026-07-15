export type Mode = 'view' | 'edit' | 'delete'

export function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(dateStr: string, isCash: boolean) {
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

  if (isCash) {
    if (dateLocalStr === todayStr) return 'Today'
    if (dateLocalStr === yesterdayStr) return 'Yesterday'
    return fullDate
  }

  if (dateLocalStr === todayStr) return `Today, ${timeStr}`
  if (dateLocalStr === yesterdayStr) return `Yesterday, ${timeStr}`
  return `${fullDate}, ${timeStr}`
}
