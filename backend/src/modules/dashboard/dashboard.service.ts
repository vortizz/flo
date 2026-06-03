import { Injectable } from '@nestjs/common'
import { Period } from './dto/get-summary.dto'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    clerkId: string,
    period: Period,
    from?: string,
    to?: string,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const { current, previous } =
      period === 'custom' && from && to
        ? this.getCustomDateRanges(new Date(from), new Date(to))
        : this.getDateRanges(period)

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

    const amounts = transactions.map(t => ({
      amount: Number(t.amount),
      type: t.type,
    }))

    const income = amounts
      .filter(t => t.type === 'CREDIT')
      .reduce((sum, t) => sum + t.amount, 0)

    const expenses = amounts
      .filter(t => t.type === 'DEBIT')
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      savings: Math.round((income - expenses) * 100) / 100,
    }
  }

  private getDateRanges(period: Period) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)
    const addDays = (d: Date, n: number) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

    let from: Date = today
    let to: Date = today
    let prevFrom: Date = today
    let prevTo: Date = today

    switch (period) {
      case 'week': {
        const day = now.getDay() === 0 ? 6 : now.getDay() - 1
        from = addDays(today, -day)
        to = addDays(from, 6)
        prevFrom = addDays(from, -7)
        prevTo = addDays(from, -1)
        break
      }
      case 'fortnight': {
        const day2 = now.getDay() === 0 ? 6 : now.getDay() - 1
        from = addDays(today, -day2 - 7)
        to = addDays(from, 13)
        prevFrom = addDays(from, -14)
        prevTo = addDays(from, -1)
        break
      }
      case 'month':
        from = new Date(now.getFullYear(), now.getMonth(), 1)
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        prevFrom = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        prevTo = new Date(now.getFullYear(), now.getMonth(), 0)
        break
      case 'year':
        from = new Date(now.getFullYear(), 0, 1)
        to = new Date(now.getFullYear(), 11, 31)
        prevFrom = new Date(now.getFullYear() - 1, 0, 1)
        prevTo = new Date(now.getFullYear() - 1, 11, 31)
        break
      case 'custom':
        // custom is handled separately via getCustomDateRanges
        break
    }

    return {
      current: { from, to: endOfDay(to) },
      previous: { from: prevFrom, to: endOfDay(prevTo) },
    }
  }

  private percentChange(previous: number, current: number): number {
    if (previous === 0) return 0
    return Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10
  }

  async getChart(clerkId: string, period: Period, from?: string, to?: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const { current } =
      period === 'custom' && from && to
        ? this.getCustomDateRanges(new Date(from), new Date(to))
        : this.getDateRanges(period)

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
      const key = t.date.toISOString().split('T')[0]
      if (!byDate.has(key)) byDate.set(key, { income: 0, expenses: 0 })
      const entry = byDate.get(key)!
      if (t.type === 'CREDIT') entry.income += Number(t.amount)
      else entry.expenses += Number(t.amount)
    }

    const days = this.getDaysInRange(current.from, current.to)
    return days.map(day => ({
      date: day,
      income: Math.round((byDate.get(day)?.income ?? 0) * 100) / 100,
      expenses: Math.round((byDate.get(day)?.expenses ?? 0) * 100) / 100,
    }))
  }

  private getDaysInRange(from: Date, to: Date): string[] {
    const days: string[] = []
    const current = new Date(from)
    while (current <= to) {
      days.push(current.toISOString().split('T')[0])
      current.setDate(current.getDate() + 1)
    }
    return days
  }

  async getCategories(
    clerkId: string,
    period: Period,
    from?: string,
    to?: string,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const { current } =
      period === 'custom' && from && to
        ? this.getCustomDateRanges(new Date(from), new Date(to))
        : this.getDateRanges(period)

    const transactions = await this.prisma.transaction.findMany({
      where: {
        account: { userId: user.id },
        date: { gte: current.from, lte: current.to },
        type: 'DEBIT',
      },
      select: { amount: true, category: true },
    })

    const byCategory = new Map<string, number>()
    for (const t of transactions) {
      const key = t.category && t.category !== 'Unknown' ? t.category : null
      if (!key) continue
      byCategory.set(key, (byCategory.get(key) ?? 0) + Number(t.amount))
    }

    const sorted = [...byCategory.entries()].sort((a, b) => b[1] - a[1])
    const top5 = sorted.slice(0, 5)
    const rest = sorted.slice(5)
    const otherAmount = rest.reduce((sum, [, amount]) => sum + amount, 0)
    if (otherAmount > 0) top5.push(['Other', otherAmount])
    const total = top5.reduce((sum, [, amount]) => sum + amount, 0)

    return top5.map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: Math.round((amount / total) * 1000) / 10,
    }))
  }

  async getRecentTransactions(
    clerkId: string,
    period: Period,
    from?: string,
    to?: string,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const { current } =
      period === 'custom' && from && to
        ? this.getCustomDateRanges(new Date(from), new Date(to))
        : this.getDateRanges(period)

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
        category: true,
        date: true,
        account: {
          select: {
            accountName: true,
            bankName: true,
          },
        },
      },
    })

    return transactions.map(t => ({
      id: t.id,
      merchant: t.merchant,
      category: t.category,
      date: t.date,
      amount: Number(t.amount),
      type: t.type,
      account: `${t.account.bankName} · ${t.account.accountName}`,
    }))
  }

  private getCustomDateRanges(from: Date, to: Date) {
    const endOfDay = (d: Date) =>
      new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999)

    const rangeDays = Math.round(
      (to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24),
    )

    const prevTo = new Date(from)
    prevTo.setDate(from.getDate() - 1)
    const prevFrom = new Date(prevTo)
    prevFrom.setDate(prevTo.getDate() - rangeDays)

    return {
      current: { from, to: endOfDay(to) },
      previous: { from: prevFrom, to: endOfDay(prevTo) },
    }
  }
}
