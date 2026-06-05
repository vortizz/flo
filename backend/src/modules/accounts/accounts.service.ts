import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { BasiqService } from '../basiq/basiq.service'
import { SourceType } from '@prisma/client'

@Injectable()
export class AccountsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly basiqService: BasiqService,
  ) {}

  async getAccounts(clerkId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const accounts = await this.prisma.account.findMany({
      where: { userId: user.id },
      include: { institution: { select: { name: true, logoUrl: true } } },
      orderBy: { createdAt: 'asc' },
    })

    const totalBalance = accounts.reduce((sum, a) => sum + Number(a.balance), 0)

    const lastSyncedAt =
      accounts
        .map(a => a.lastSyncedAt)
        .filter(Boolean)
        .sort((a, b) => new Date(b!).getTime() - new Date(a!).getTime())[0] ??
      null

    return {
      summary: {
        totalBalance: Math.round(totalBalance * 100) / 100,
        totalAccounts: accounts.length,
        lastSyncedAt,
      },
      accounts: accounts.map(a => ({
        id: a.id,
        bankName: a.bankName,
        accountName: a.accountName,
        balance: Number(a.balance),
        last4: a.last4,
        lastSyncedAt: a.lastSyncedAt,
        logoUrl: a.institution?.logoUrl ?? null,
        status: 'connected',
      })),
    }
  }

  async deleteAccount(clerkId: string, accountId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId: user.id },
    })

    if (!account) throw new Error('Account not found')

    await this.prisma.account.delete({ where: { id: accountId } })

    return { success: true }
  }

  async syncAccount(clerkId: string, accountId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const account = await this.prisma.account.findFirst({
      where: { id: accountId, userId: user.id },
    })

    if (!account) throw new Error('Account not found')
    if (!user.basiqUserId) throw new Error('No Basiq user found')

    const from = account.lastSyncedAt
      ? account.lastSyncedAt.toISOString().split('T')[0]
      : undefined

    const transactions = await this.basiqService.getTransactions(
      user.basiqUserId,
      from,
    )

    const accountTransactions = transactions.filter(
      t => t.account === account.basiqId,
    )

    let synced = 0
    for (const tx of accountTransactions) {
      const normalised = this.basiqService.normaliseTransaction(tx, account.id)
      await this.prisma.transaction.upsert({
        where: { basiqId: tx.id },
        update: {
          merchant: normalised.merchant,
          category: normalised.category,
          description: normalised.description,
          raw: normalised.raw,
        },
        create: {
          basiqId: normalised.basiqId,
          accountId: normalised.accountId,
          amount: normalised.amount,
          type: normalised.type,
          merchant: normalised.merchant,
          category: normalised.category,
          description: normalised.description,
          date: normalised.date,
          raw: normalised.raw,
          source: SourceType.BASIQ,
        },
      })
      synced++
    }

    await this.prisma.account.update({
      where: { id: accountId },
      data: { lastSyncedAt: new Date() },
    })

    return { synced }
  }

  async syncAllAccounts(clerkId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const accounts = await this.prisma.account.findMany({
      where: { userId: user.id },
      select: { id: true },
    })

    const results = await Promise.allSettled(
      accounts.map(a => this.syncAccount(clerkId, a.id)),
    )

    const synced = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return { synced, failed }
  }
}
