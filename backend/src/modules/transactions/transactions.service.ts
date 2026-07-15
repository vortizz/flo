import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { GetTransactionsDto } from './dto/get-transactions.dto'
import { CreateManualTransactionDto } from './dto/create-manual-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'
import { Institution, SourceType } from '@prisma/client'
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

    const { page, limit, search, type, accountId, categoryId, from, to } = dto
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
    if (categoryId) where.categoryId = categoryId

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
          categoryId: true,
          category: {
            select: {
              name: true,
              color: true,
              icon: true,
            },
          },
          description: true,
          date: true,
          source: true,
          isExcluded: true,
          account: {
            select: {
              id: true,
              accountName: true,
              bankName: true,
              isCash: true,
              last4: true,
              institution: {
                select: { logoUrl: true },
              },
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
        category: t.category?.name ?? null,
        categoryId: t.categoryId ?? null,
        categoryColor: t.category?.color ?? null,
        categoryIcon: t.category?.icon ?? null,
        date: t.date,
        amount: Number(t.amount),
        type: t.type,
        source: t.source,
        isExcluded: t.isExcluded,
        isCash: t.account.isCash,
        account: t.account.accountName,
        accountId: t.account.id,
        logoUrl: t.account.institution?.logoUrl ?? null,
        last4: t.account.last4,
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
          isCash: true,
          institution: {
            select: { logoUrl: true },
          },
        },
      }),
      this.prisma.category.findMany({
        where: {
          OR: [{ userId: null }, { userId: user.id }],
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          color: true,
          icon: true,
          type: true,
          userId: true,
        },
      }),
    ])

    const nameCounts = categories.reduce<Record<string, number>>((acc, c) => {
      acc[c.name] = (acc[c.name] ?? 0) + 1
      return acc
    }, {})

    return {
      accounts: accounts.map(a => ({
        id: a.id,
        accountName: a.accountName,
        bankName: a.bankName,
        last4: a.last4,
        isCash: a.isCash,
        logoUrl: (a.institution as Institution)?.logoUrl ?? null,
      })),
      categories: categories.map(c => ({
        id: c.id,
        name:
          nameCounts[c.name] > 1
            ? `${c.name} (${c.type === 'DEBIT' ? 'Expense' : 'Income'})`
            : c.name,
        color: c.color,
        icon: c.icon,
        userId: c.userId,
      })),
    }
  }

  async createManualTransaction(
    clerkId: string,
    dto: CreateManualTransactionDto,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const cashAccount = await this.prisma.account.findFirst({
      where: { userId: user.id, isCash: true },
    })

    if (!cashAccount) throw new NotFoundException('Cash account not found')

    const transaction = await this.prisma.transaction.create({
      data: {
        accountId: cashAccount.id,
        amount: dto.amount,
        type: dto.type,
        merchant: dto.merchant,
        categoryId: dto.categoryId ?? null,
        description: dto.description ?? null,
        date: new Date(dto.date),
        source: SourceType.MANUAL,
      },
    })

    await this.updateCashBalance(cashAccount.id)

    return transaction
  }

  async updateTransaction(
    clerkId: string,
    transactionId: string,
    dto: UpdateTransactionDto,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { account: true },
    })

    if (!transaction) throw new NotFoundException('Transaction not found')
    if (transaction.account.userId !== user.id)
      throw new ForbiddenException('Not your transaction')

    const isManual = transaction.source === SourceType.MANUAL

    const updated = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: {
        // Manual only
        ...(isManual && dto.type && { type: dto.type }),
        ...(isManual && dto.amount && { amount: dto.amount }),
        ...(isManual && dto.merchant && { merchant: dto.merchant }),
        ...(isManual && dto.date && { date: new Date(dto.date) }),
        // All transactions
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.isExcluded !== undefined && { isExcluded: dto.isExcluded }),
      },
    })

    if (isManual) await this.updateCashBalance(transaction.accountId)

    return updated
  }

  async deleteManualTransaction(clerkId: string, transactionId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: { account: true },
    })

    if (!transaction) throw new NotFoundException('Transaction not found')
    if (transaction.account.userId !== user.id)
      throw new ForbiddenException('Not your transaction')
    if (transaction.source !== SourceType.MANUAL)
      throw new ForbiddenException('Can only delete manual transactions')

    await this.prisma.transaction.delete({ where: { id: transactionId } })
    await this.updateCashBalance(transaction.accountId)

    return { success: true }
  }

  private async updateCashBalance(accountId: string) {
    const result = await this.prisma.transaction.groupBy({
      by: ['type'],
      where: { accountId },
      _sum: { amount: true },
    })

    const credits = Number(
      result.find(r => r.type === 'CREDIT')?._sum.amount ?? 0,
    )
    const debits = Number(
      result.find(r => r.type === 'DEBIT')?._sum.amount ?? 0,
    )

    await this.prisma.account.update({
      where: { id: accountId },
      data: { balance: credits - debits },
    })
  }
}
