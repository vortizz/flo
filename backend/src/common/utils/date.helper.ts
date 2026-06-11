import { Period } from 'src/modules/dashboard/dto/get-summary.dto'

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0)
}

export function endOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
}

export function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function toDateKeyTz(d: Date, tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-AU', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(d)
    const y = parts.find(p => p.type === 'year')!.value
    const m = parts.find(p => p.type === 'month')!.value
    const day = parts.find(p => p.type === 'day')!.value
    return `${y}-${m}-${day}`
  } catch {
    return toDateKey(d)
  }
}

export function startOfDayTz(d: Date, tz: string): Date {
  try {
    const key = toDateKeyTz(d, tz)
    return new Date(`${key}T00:00:00`)
  } catch {
    return startOfDay(d)
  }
}

export function nowInTz(tz: string): Date {
  const key = toDateKeyTz(new Date(), tz)
  return new Date(`${key}T00:00:00`)
}

function getUtcOffsetMs(d: Date, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-AU', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d)

  const get = (type: string) => parts.find(p => p.type === type)!.value
  const localAsUtc = new Date(
    `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}:${get('second')}Z`,
  )
  return localAsUtc.getTime() - d.getTime()
}

export function startOfDayUtc(dateStr: string, tz: string): Date {
  const probe = new Date(`${dateStr}T12:00:00Z`)
  const offsetMs = getUtcOffsetMs(probe, tz)
  return new Date(new Date(`${dateStr}T00:00:00Z`).getTime() - offsetMs)
}

export function endOfDayUtc(dateStr: string, tz: string): Date {
  const probe = new Date(`${dateStr}T12:00:00Z`)
  const offsetMs = getUtcOffsetMs(probe, tz)
  return new Date(new Date(`${dateStr}T23:59:59.999Z`).getTime() - offsetMs)
}

export function getDaysInRange(
  from: Date,
  to: Date,
  tz: string = 'UTC',
): string[] {
  const days: string[] = []
  const endKey = toDateKeyTz(to, tz)
  let current = new Date(from)
  while (true) {
    const key = toDateKeyTz(current, tz)
    days.push(key)
    if (key >= endKey) break
    current = new Date(current.getTime() + 24 * 60 * 60 * 1000)
  }
  return [...new Set(days)]
}

export function getDateRanges(period: Period, tz: string = 'UTC') {
  const now = nowInTz(tz)
  const todayKey = toDateKeyTz(new Date(), tz)

  const addDays = (d: Date, n: number) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

  const capToToday = (dateKey: string) =>
    dateKey > todayKey ? endOfDayUtc(todayKey, tz) : endOfDayUtc(dateKey, tz)

  let fromKey: string = todayKey
  let toKey: string = todayKey
  let prevFromKey: string = todayKey
  let prevToKey: string = todayKey

  switch (period) {
    case 'week': {
      const day = now.getDay() === 0 ? 6 : now.getDay() - 1
      const from = addDays(startOfDay(now), -day)
      fromKey = toDateKey(from)
      toKey = toDateKey(addDays(from, 6))
      prevFromKey = toDateKey(addDays(from, -7))
      prevToKey = toDateKey(addDays(from, -1))
      break
    }
    case 'fortnight': {
      const day2 = now.getDay() === 0 ? 6 : now.getDay() - 1
      const from = addDays(startOfDay(now), -day2 - 7)
      fromKey = toDateKey(from)
      toKey = toDateKey(addDays(from, 13))
      prevFromKey = toDateKey(addDays(from, -14))
      prevToKey = toDateKey(addDays(from, -1))
      break
    }
    case 'month':
      fromKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
      toKey = toDateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0))
      prevFromKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}-01`
      prevToKey = toDateKey(new Date(now.getFullYear(), now.getMonth(), 0))
      break
    case 'year':
      fromKey = `${now.getFullYear()}-01-01`
      toKey = `${now.getFullYear()}-12-31`
      prevFromKey = `${now.getFullYear() - 1}-01-01`
      prevToKey = `${now.getFullYear() - 1}-12-31`
      break
    case 'custom':
      break
  }

  return {
    current: {
      from: startOfDayUtc(fromKey, tz),
      to: capToToday(toKey),
    },
    previous: {
      from: startOfDayUtc(prevFromKey, tz),
      to: endOfDayUtc(prevToKey, tz),
    },
  }
}

export function getCustomDateRanges(
  from: string,
  to: string,
  tz: string = 'UTC',
) {
  const normalizedFrom = startOfDayUtc(from, tz)
  const normalizedTo = endOfDayUtc(to, tz)

  const rangeDays = Math.round(
    (new Date(`${to}T12:00:00Z`).getTime() -
      new Date(`${from}T12:00:00Z`).getTime()) /
      (1000 * 60 * 60 * 24),
  )

  const prevToStr = toDateKey(
    new Date(new Date(`${from}T12:00:00Z`).getTime() - 24 * 60 * 60 * 1000),
  )
  const prevFromStr = toDateKey(
    new Date(
      new Date(`${from}T12:00:00Z`).getTime() -
        (rangeDays + 1) * 24 * 60 * 60 * 1000,
    ),
  )

  return {
    current: { from: normalizedFrom, to: normalizedTo },
    previous: {
      from: startOfDayUtc(prevFromStr, tz),
      to: endOfDayUtc(prevToStr, tz),
    },
  }
}
