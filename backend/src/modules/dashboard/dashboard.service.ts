import { Injectable } from '@nestjs/common'
import { Period } from './dto/get-summary.dto'
import { PrismaService } from 'src/prisma.service'
import {
  startOfDay,
  toDateKey,
  toDateKeyTz,
  startOfDayTz,
  startOfDayUtc,
  endOfDayUtc,
  nowInTz,
  getDaysInRange,
  getDateRanges,
  getCustomDateRanges,
} from 'src/common/utils/date.helper'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    clerkId: string,
    period: Period,
    from?: string,
    to?: string,
    tz: string = 'UTC',
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const { current, previous } =
      period === 'custom' && from && to
        ? getCustomDateRanges(from, to, tz)
        : getDateRanges(period, tz)

    const [currentTotals, previousTotals] = await Promise.all([
      this.getTotalsForRange(user.id, current.from, current.to),
      this.getTotalsForRange(user.id, previous.from, previous.to),
    ])

    return {
      period,
      current: currentTotals,
      previous: previousTotals,
      changes: {
        income: this.percentChange(previousTotals.income, currentTotals.income),
        expenses: this.percentChange(
          previousTotals.expenses,
          currentTotals.expenses,
        ),
        savings: this.percentChange(
          previousTotals.savings,
          currentTotals.savings,
        ),
      },
    }
  }

  private async getTotalsForRange(userId: string, from: Date, to: Date) {
    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: { userId },
        date: { gte: from, lte: to },
      },
      select: { amount: true, type: true },
    })

    const income = transactions
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const expenses = transactions
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    return {
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      savings: Math.round((income - expenses) * 100) / 100,
    }
  }

  async getChart(
    clerkId: string,
    period: Period,
    from?: string,
    to?: string,
    tz: string = 'UTC',
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const { current } =
      period === 'custom' && from && to
        ? getCustomDateRanges(from, to, tz)
        : getDateRanges(period, tz)

    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: { userId: user.id },
        date: { gte: current.from, lte: current.to },
      },
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' },
    })

    const byDate = new Map<string, { income: number; expenses: number }>()
    for (const t of transactions) {
      const key = toDateKeyTz(t.date, tz)
      if (!byDate.has(key)) byDate.set(key, { income: 0, expenses: 0 })
      const entry = byDate.get(key)!
      if (t.type === 'CREDIT') entry.income += Number(t.amount)
      else entry.expenses += Number(t.amount)
    }

    const days = getDaysInRange(current.from, current.to, tz)
    return days.map(day => ({
      date: day,
      income: Math.round((byDate.get(day)?.income ?? 0) * 100) / 100,
      expenses: Math.round((byDate.get(day)?.expenses ?? 0) * 100) / 100,
    }))
  }

  async getChartSummary(
    clerkId: string,
    period: Period,
    from?: string,
    to?: string,
    tz: string = 'UTC',
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const now = nowInTz(tz)
    const todayKey = toDateKeyTz(new Date(), tz)
    let rangeFrom: Date
    let rangeTo: Date = endOfDayUtc(todayKey, tz)
    let groupBy: 'week' | 'fortnight' | 'month'
    let anchorFrom: Date | undefined
    let customChunkSize: number | undefined

    if (period === 'week') {
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
      const weekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - dayOfWeek,
      )
      const from = new Date(weekStart)
      from.setDate(from.getDate() - 20 * 7)
      rangeFrom = startOfDayUtc(toDateKey(from), tz)
      rangeTo = endOfDayUtc(todayKey, tz)
      anchorFrom = startOfDayUtc(toDateKey(weekStart), tz)
      customChunkSize = 7
      groupBy = 'week'
    } else if (period === 'fortnight') {
      const dayOfWeek = now.getDay() === 0 ? 6 : now.getDay() - 1
      const weekStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - dayOfWeek,
      )
      const fortnightStart = new Date(weekStart)
      fortnightStart.setDate(fortnightStart.getDate() - 7)
      const from = new Date(fortnightStart)
      from.setDate(from.getDate() - 10 * 14)
      rangeFrom = startOfDayUtc(toDateKey(from), tz)
      rangeTo = endOfDayUtc(todayKey, tz)
      anchorFrom = startOfDayUtc(toDateKey(fortnightStart), tz)
      customChunkSize = 14
      groupBy = 'fortnight'
    } else if (period === 'month') {
      const from = new Date(now.getFullYear() - 1, now.getMonth(), 1)
      rangeFrom = startOfDayUtc(toDateKey(from), tz)
      groupBy = 'month'
    } else if (period === 'custom' && from && to) {
      const days =
        Math.round(
          (new Date(`${to}T12:00:00Z`).getTime() -
            new Date(`${from}T12:00:00Z`).getTime()) /
            (1000 * 60 * 60 * 24),
        ) + 1

      const fromDate = startOfDay(nowInTz(tz))
      fromDate.setDate(fromDate.getDate() - days * 4)

      if (days <= 90) {
        rangeFrom = startOfDayUtc(toDateKey(fromDate), tz)
        groupBy = 'week'
      } else {
        fromDate.setMonth(fromDate.getMonth() - 12)
        rangeFrom = startOfDayUtc(toDateKey(fromDate), tz)
        groupBy = 'month'
      }
      rangeTo = endOfDayUtc(to, tz)
      anchorFrom = startOfDayUtc(from, tz)
      customChunkSize = days
    } else {
      const from = new Date(now.getFullYear() - 1, now.getMonth(), 1)
      rangeFrom = startOfDayUtc(toDateKey(from), tz)
      groupBy = 'month'
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: { userId: user.id },
        date: { gte: rangeFrom, lte: rangeTo },
      },
      select: { amount: true, type: true, date: true },
      orderBy: { date: 'asc' },
    })

    return this.groupTransactions(
      transactions,
      groupBy,
      rangeFrom,
      rangeTo,
      anchorFrom,
      customChunkSize,
      tz,
    )
  }

  private groupTransactions(
    transactions: { amount: any; type: string; date: Date }[],
    groupBy: 'week' | 'fortnight' | 'month',
    rangeFrom: Date,
    rangeTo: Date,
    anchorFrom?: Date,
    customChunkSize?: number,
    tz: string = 'UTC',
  ) {
    const map = new Map<
      string,
      { label: string; from: Date; income: number; expenses: number }
    >()

    if (groupBy === 'month') {
      for (const t of transactions) {
        const localDate = startOfDayTz(t.date, tz)
        const key = `${localDate.getFullYear()}-${localDate.getMonth()}`
        const label = localDate.toLocaleDateString('en-AU', { month: 'short' })
        if (!map.has(key))
          map.set(key, { label, from: localDate, income: 0, expenses: 0 })
        const entry = map.get(key)!
        if (t.type === 'CREDIT') {
          entry.income =
            Math.round((entry.income + Number(t.amount)) * 100) / 100
        } else {
          entry.expenses =
            Math.round((entry.expenses + Number(t.amount)) * 100) / 100
        }
      }
    } else {
      const rangeSize = groupBy === 'week' ? 7 : 14
      const chunkSize = customChunkSize ?? rangeSize
      const chunks: { from: Date; to: Date; key: string; label: string }[] = []

      if (anchorFrom) {
        const anchorKey = toDateKeyTz(anchorFrom, tz)
        const toKey = toDateKeyTz(rangeTo, tz)
        const lastLabel = `${new Date(`${anchorKey}T12:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}–${new Date(`${toKey}T12:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
        chunks.push({
          from: anchorFrom,
          to: rangeTo,
          key: anchorKey,
          label: lastLabel,
        })
        map.set(anchorKey, {
          label: lastLabel,
          from: anchorFrom,
          income: 0,
          expenses: 0,
        })

        let chunkEndMs = anchorFrom.getTime() - 24 * 60 * 60 * 1000

        while (chunkEndMs >= rangeFrom.getTime()) {
          const chunkEnd = new Date(chunkEndMs)
          const chunkStart = new Date(
            chunkEndMs - (chunkSize - 1) * 24 * 60 * 60 * 1000,
          )
          const effectiveStart = chunkStart < rangeFrom ? rangeFrom : chunkStart
          const startKey = toDateKeyTz(effectiveStart, tz)
          const endKey = toDateKeyTz(chunkEnd, tz)
          const label = `${new Date(`${startKey}T12:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}–${new Date(`${endKey}T12:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
          chunks.unshift({
            from: effectiveStart,
            to: chunkEnd,
            key: startKey,
            label,
          })
          map.set(startKey, {
            label,
            from: effectiveStart,
            income: 0,
            expenses: 0,
          })
          chunkEndMs = chunkStart.getTime() - 24 * 60 * 60 * 1000
        }
      } else {
        const totalDays = Math.round(
          (rangeTo.getTime() - rangeFrom.getTime()) / (1000 * 60 * 60 * 24),
        )
        const numChunks = Math.ceil(totalDays / rangeSize)
        const alignedFromMs =
          rangeTo.getTime() - numChunks * rangeSize * 24 * 60 * 60 * 1000

        let chunkEndMs = rangeTo.getTime()
        while (chunkEndMs > alignedFromMs) {
          const chunkEnd = new Date(chunkEndMs)
          const chunkStart = new Date(
            chunkEndMs - rangeSize * 24 * 60 * 60 * 1000,
          )
          const effectiveStart =
            chunkStart.getTime() < alignedFromMs
              ? new Date(alignedFromMs)
              : chunkStart
          const startKey = toDateKeyTz(effectiveStart, tz)
          const endKey = toDateKeyTz(chunkEnd, tz)
          const label = `${new Date(`${startKey}T12:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}–${new Date(`${endKey}T12:00:00Z`).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
          chunks.unshift({
            from: effectiveStart,
            to: chunkEnd,
            key: startKey,
            label,
          })
          map.set(startKey, {
            label,
            from: effectiveStart,
            income: 0,
            expenses: 0,
          })
          chunkEndMs = chunkStart.getTime()
        }
      }

      for (const t of transactions) {
        const txKey = toDateKeyTz(t.date, tz)
        const chunk = chunks.find(c => {
          const fromKey = toDateKeyTz(c.from, tz)
          const toKey = toDateKeyTz(c.to, tz)
          return txKey >= fromKey && txKey <= toKey
        })
        if (!chunk) continue
        const entry = map.get(chunk.key)!
        if (t.type === 'CREDIT') {
          entry.income =
            Math.round((entry.income + Number(t.amount)) * 100) / 100
        } else {
          entry.expenses =
            Math.round((entry.expenses + Number(t.amount)) * 100) / 100
        }
      }
    }

    return [...map.values()]
      .sort((a, b) => a.from.getTime() - b.from.getTime())
      .map(({ label, income, expenses }) => ({
        date: label,
        income,
        expenses,
      }))
  }

  async getCategories(
    clerkId: string,
    period: Period,
    from?: string,
    to?: string,
    tz: string = 'UTC',
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const { current } =
      period === 'custom' && from && to
        ? getCustomDateRanges(from, to, tz)
        : getDateRanges(period, tz)

    const [transactions, otherCategory] = await Promise.all([
      this.prisma.transaction.findMany({
        where: {
          account: { userId: user.id },
          date: { gte: current.from, lte: current.to },
          type: 'DEBIT',
        },
        select: {
          amount: true,
          category: { select: { name: true, color: true } },
        },
      }),
      this.prisma.category.findFirst({
        where: { name: 'Other' },
        select: { color: true },
      }),
    ])

    const otherColor = otherCategory?.color ?? '#8b949e'

    const byCategory = new Map<string, { amount: number; color: string }>()
    for (const t of transactions) {
      const key = t.category?.name ?? 'Other'
      const color = t.category?.color ?? otherColor
      const existing = byCategory.get(key)
      byCategory.set(key, {
        amount: (existing?.amount ?? 0) + Number(t.amount),
        color: existing?.color ?? color,
      })
    }

    const named = [...byCategory.entries()]
      .filter(([k]) => k !== 'Other')
      .sort((a, b) => b[1].amount - a[1].amount)

    const otherEntry = byCategory.get('Other')
    const top5 = named.slice(0, 5)
    const rest = named.slice(5)
    const otherAmount =
      rest.reduce((sum, [, v]) => sum + v.amount, 0) + (otherEntry?.amount ?? 0)

    if (otherAmount > 0)
      top5.push(['Other', { amount: otherAmount, color: otherColor }])

    const total = top5.reduce(
      (sum, [, v]) => sum + (v as { amount: number; color: string }).amount,
      0,
    )

    return top5.map(([category, value]) => {
      const { amount, color } = value as { amount: number; color: string }
      return {
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round((amount / total) * 1000) / 10,
        color,
      }
    })
  }

  async getRecentTransactions(
    clerkId: string,
    period: Period,
    from?: string,
    to?: string,
    tz: string = 'UTC',
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const { current } =
      period === 'custom' && from && to
        ? getCustomDateRanges(from, to, tz)
        : getDateRanges(period, tz)

    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: { userId: user.id },
        date: { gte: current.from, lte: current.to },
      },
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        type: true,
        merchant: true,
        category: {
          select: {
            name: true,
            color: true,
            icon: true,
          },
        },
        date: true,
        account: {
          select: {
            accountName: true,
            bankName: true,
            isCash: true,
          },
        },
      },
    })

    return transactions.map(t => ({
      id: t.id,
      merchant: t.merchant,
      category: t.category?.name ?? null,
      categoryColor: t.category?.color ?? null,
      categoryIcon: t.category?.icon ?? null,
      date: t.date,
      amount: Number(t.amount),
      type: t.type,
      account: `${t.account.bankName} · ${t.account.accountName}`,
      isCash: t.account.isCash,
    }))
  }

  async getDashboardAccounts(clerkId: string, tz: string = 'UTC') {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const todayKey = toDateKeyTz(new Date(), tz)
    const todayStart = startOfDayUtc(todayKey, tz)
    const todayEnd = endOfDayUtc(todayKey, tz)

    const accounts = await this.prisma.account.findMany({
      where: { userId: user.id },
      include: {
        institution: { select: { name: true, logoUrl: true } },
        transactions: {
          where: { date: { gte: todayStart, lte: todayEnd } },
          select: { amount: true, type: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)

    return {
      totalBalance: Math.round(totalBalance * 100) / 100,
      totalAccounts: accounts.length,
      accounts: accounts.map(a => {
        const todayCredit = a.transactions
          .filter(t => t.type === 'CREDIT')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        const todayDebit = a.transactions
          .filter(t => t.type === 'DEBIT')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        const dailyChange = Math.round((todayCredit - todayDebit) * 100) / 100

        return {
          id: a.id,
          bankName: a.bankName,
          accountName: a.accountName,
          last4: a.last4,
          balance: Number(a.balance),
          logoUrl: a.institution?.logoUrl ?? null,
          dailyChange,
          isCash: a.isCash,
        }
      }),
    }
  }

  private percentChange(previous: number, current: number): number {
    if (previous === 0) return 0
    return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10
  }
}
