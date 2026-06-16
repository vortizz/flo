import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'
import { BasiqService } from '../basiq/basiq.service'
import { SourceType } from '@prisma/client'

@Injectable()
export class AccountsService {
  private readonly logger = new Logger(AccountsService.name)

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
        status: a.status.toLowerCase() as 'connected' | 'disconnected',
        isCash: a.isCash,
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

    if (user.basiqUserId && account.basiqConnectionId) {
      const sharedCount = await this.prisma.account.count({
        where: {
          userId: user.id,
          basiqConnectionId: account.basiqConnectionId,
          id: { not: accountId },
        },
      })

      if (sharedCount === 0) {
        try {
          await this.basiqService.revokeConnection(
            user.basiqUserId,
            account.basiqConnectionId,
          )
        } catch (error) {
          this.logger.warn(
            `Failed to revoke Basiq connection, proceeding with local delete: ${error}`,
          )
        }
      }
    }

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
      ? `${account.lastSyncedAt.getFullYear()}-${String(account.lastSyncedAt.getMonth() + 1).padStart(2, '0')}-${String(account.lastSyncedAt.getDate()).padStart(2, '0')}`
      : undefined

    const transactions = await this.basiqService.getTransactions(
      user.basiqUserId,
      from,
    )

    const accountTransactions = transactions.filter(
      t => t.account === account.basiqId,
    )

    const normalisedTxs = accountTransactions.map(tx =>
      this.basiqService.normaliseTransaction(tx, account.id),
    )

    const result = await this.prisma.transaction.createMany({
      data: normalisedTxs.map(t => ({
        basiqId: t.basiqId,
        accountId: t.accountId,
        amount: t.amount,
        type: t.type,
        merchant: t.merchant,
        category: t.category,
        description: t.description,
        date: t.date,
        raw: t.raw,
        source: SourceType.BASIQ,
      })),
      skipDuplicates: true,
    })

    await this.prisma.account.update({
      where: { id: accountId },
      data: { lastSyncedAt: new Date() },
    })

    return { synced: result.count }
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
