import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class AccountsService {
  constructor(private readonly prisma: PrismaService) {}

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
}
