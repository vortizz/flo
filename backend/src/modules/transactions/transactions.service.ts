import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { GetTransactionsDto } from './dto/get-transactions.dto'
import { Institution } from '@prisma/client'
import { startOfDayUtc, endOfDayUtc } from 'src/common/utils/date.helper'

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async getTransactions(
    clerkId: string,
    dto: GetTransactionsDto,
    tz: string = 'UTC',
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const { page, limit, search, type, accountId, category, from, to } = dto
    const skip = (page - 1) * limit

    const where: any = {
      account: { userId: user.id },
    }

    if (search) {
      where.OR = [
        { merchant: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (type) where.type = type
    if (accountId) where.accountId = accountId
    if (category) where.category = category

    if (from || to) {
      where.date = {}
      if (from) where.date.gte = startOfDayUtc(from, tz)
      if (to) where.date.lte = endOfDayUtc(to, tz)
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          amount: true,
          type: true,
          merchant: true,
          category: true,
          description: true,
          date: true,
          account: {
            select: {
              id: true,
              accountName: true,
              bankName: true,
            },
          },
        },
      }),
      this.prisma.transaction.count({ where }),
    ])

    return {
      data: transactions.map(t => ({
        id: t.id,
        merchant: t.merchant,
        description: t.description,
        category: t.category,
        date: t.date,
        amount: Number(t.amount),
        type: t.type,
        account: t.account.accountName,
        accountId: t.account.id,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  async getFilterOptions(clerkId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const [accounts, categories] = await Promise.all([
      this.prisma.account.findMany({
        where: { userId: user.id },
        select: {
          id: true,
          accountName: true,
          bankName: true,
          last4: true,
          institution: {
            select: { logoUrl: true },
          },
        },
      }),
      this.prisma.transaction.findMany({
        where: { account: { userId: user.id }, category: { not: null } },
        select: { category: true },
        distinct: ['category'],
        orderBy: { category: 'asc' },
      }),
    ])

    return {
      accounts: accounts.map(a => ({
        id: a.id,
        accountName: a.accountName,
        bankName: a.bankName,
        last4: a.last4,
        logoUrl: (a.institution as Institution)?.logoUrl ?? null,
      })),
      categories: categories.map(t => t.category!).filter(c => c !== 'Unknown'),
    }
  }
}
