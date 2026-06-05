import {
  Body,
  Controller,
  Post,
  Req,
  NotFoundException,
  BadRequestException,
  Get,
  Param,
  Logger,
} from '@nestjs/common'
import { BasiqService } from './basiq.service'
import { PrismaService } from '../../prisma.service'
import { SourceType } from '@prisma/client'

@Controller('basiq')
export class BasiqController {
  private readonly logger = new Logger(BasiqController.name)

  constructor(
    private basiqService: BasiqService,
    private prisma: PrismaService,
  ) {}

  @Post('auth-link')
  async getAuthLink(
    @Req() req: any,
    @Body()
    body: { institutionId?: string; bankIndex?: number; total?: number },
  ) {
    const clerkId = req.user.userId

    let user = await this.prisma.user.findUnique({
      where: { clerkId },
    })

    if (!user) throw new NotFoundException('User not found')

    if (!user.mobile) {
      throw new BadRequestException('Mobile number required to connect a bank')
    }

    if (!user.basiqUserId) {
      const basiqUserId = await this.basiqService.createUser(
        user.email,
        user.mobile,
        user.fullName?.split(' ')?.[0] ?? '',
      )
      user = await this.prisma.user.update({
        where: { clerkId },
        data: { basiqUserId },
      })
    }

    const authLinkUrl = await this.basiqService.createAuthLink(
      user.basiqUserId!,
      user.mobile!,
      body.institutionId,
      body.bankIndex,
      body.total,
    )

    return { url: authLinkUrl }
  }

  @Get('jobs/:jobId')
  async getJob(@Param('jobId') jobId: string) {
    return this.basiqService.getJob(jobId)
  }

  @Post('sync')
  async syncAccounts(@Req() req: any) {
    const clerkId = req.user.userId

    const user = await this.prisma.user.findUnique({ where: { clerkId } })
    if (!user) throw new NotFoundException('User not found')
    if (!user.basiqUserId) throw new BadRequestException('No Basiq user found')

    // Retry accounts
    let accounts: any[] = []
    for (let attempt = 1; attempt <= 5; attempt++) {
      accounts = await this.basiqService.syncAccounts(user.basiqUserId)
      this.logger.log(`Sync attempt ${attempt}: ${accounts.length} accounts`)
      if (accounts.length > 0) break
      if (attempt < 5) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt))
      }
    }

    // Upsert accounts
    const savedAccounts: { id: string; basiqId: string }[] = []
    for (const account of accounts) {
      const institution = await this.prisma.institution.findUnique({
        where: { id: account.institution },
      })

      const last4 =
        account.accountNo?.slice(-4) || account.maskedNumber?.slice(-4) || null

      const saved = await this.prisma.account.upsert({
        where: { basiqId: account.id },
        update: {
          accountName: account.displayName || account.name,
          balance: account.balance,
          last4,
          institutionId: institution?.id ?? null,
          lastSyncedAt: new Date(),
        },
        create: {
          userId: user.id,
          basiqId: account.id,
          institutionId: institution?.id ?? null,
          bankName: institution?.name || account.institution,
          accountName: account.displayName || account.name,
          balance: account.balance || 0,
          basiqConnectionId: account.connection ?? null,
          last4,
          lastSyncedAt: new Date(),
        },
      })
      savedAccounts.push({ id: saved.id, basiqId: account.id })
    }

    // Fetch and sync transactions
    const transactions = await this.basiqService.getTransactions(
      user.basiqUserId,
    )

    let synced = 0
    for (const tx of transactions) {
      // Find matching Flo account
      const floAccount = savedAccounts.find(a => a.basiqId === tx.account)
      if (!floAccount) continue

      const normalised = this.basiqService.normaliseTransaction(
        tx,
        floAccount.id,
      )

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

    await this.prisma.user.update({
      where: { clerkId },
      data: { onboardingCompleted: true },
    })

    return { accounts: accounts.length, transactions: synced }
  }
}
