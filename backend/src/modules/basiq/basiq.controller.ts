import {
  Body,
  Controller,
  Post,
  NotFoundException,
  BadRequestException,
  Get,
  Param,
  Logger,
  Headers,
  Req,
  HttpCode,
} from '@nestjs/common'
import type { FastifyRequest } from 'fastify'
import { BasiqService } from './basiq.service'
import { PrismaService } from '../../prisma.service'
import { AccountStatus, SourceType } from '@prisma/client'
import type { ClerkUser } from 'src/common/types'
import { User } from 'src/common/decorators/user.decorator'
import { Public } from '../auth/auth.decorator'

@Controller('basiq')
export class BasiqController {
  private readonly logger = new Logger(BasiqController.name)

  constructor(
    private basiqService: BasiqService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: FastifyRequest,
    @Headers('x-basiq-signature') signature: string,
    @Body() body: any,
  ) {
    const rawBody = (req as any).rawBody
    if (!rawBody) {
      this.logger.warn('Webhook received without raw body')
      return { received: true }
    }

    const isValid = this.basiqService.verifyWebhookSignature(rawBody, signature)

    if (!isValid) {
      this.logger.warn('Invalid Basiq webhook signature')
      return { received: true }
    }

    const eventType = body?.type

    this.logger.log(`Basiq webhook received: ${eventType}`)

    if (eventType === 'consent.revoked' || eventType === 'consent.expired') {
      await this.basiqService.handleConsentRevoked(body)
    }

    return { received: true }
  }

  @Post('auth-link')
  async getAuthLink(
    @User() userL: ClerkUser,
    @Body()
    body: {
      institutionId?: string
      bankIndex?: number
      total?: number
      source?: string
    },
  ) {
    const clerkId = userL.userId

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
      body.source,
    )

    return { url: authLinkUrl }
  }

  @Get('jobs/:jobId')
  async getJob(@Param('jobId') jobId: string) {
    return this.basiqService.getJob(jobId)
  }

  @Post('sync')
  async syncAccounts(@User() userL: ClerkUser) {
    const clerkId = userL.userId

    const user = await this.prisma.user.findUnique({ where: { clerkId } })
    if (!user) throw new NotFoundException('User not found')
    if (!user.basiqUserId) throw new BadRequestException('No Basiq user found')

    let accounts: any[] = []
    for (let attempt = 1; attempt <= 5; attempt++) {
      accounts = await this.basiqService.syncAccounts(user.basiqUserId)
      this.logger.log(`Sync attempt ${attempt}: ${accounts.length} accounts`)
      if (accounts.length > 0) break
      if (attempt < 5) {
        await new Promise(resolve => setTimeout(resolve, 3000 * attempt))
      }
    }

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
          status: AccountStatus.CONNECTED,
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
          status: AccountStatus.CONNECTED,
        },
      })
      savedAccounts.push({ id: saved.id, basiqId: account.id })
    }

    const transactions = await this.basiqService.getTransactions(
      user.basiqUserId,
    )
    const categoryMap = await this.basiqService.loadCategoryMap()

    let synced = 0
    for (const tx of transactions) {
      const floAccount = savedAccounts.find(a => a.basiqId === tx.account)
      if (!floAccount) continue

      const normalised = this.basiqService.normaliseTransaction(
        tx,
        floAccount.id,
        categoryMap,
      )

      await this.prisma.transaction.upsert({
        where: { basiqId: tx.id },
        update: {
          merchant: normalised.merchant,
          categoryId: normalised.categoryId,
          description: normalised.description,
          raw: normalised.raw,
        },
        create: {
          basiqId: normalised.basiqId,
          accountId: normalised.accountId,
          amount: normalised.amount,
          type: normalised.type,
          merchant: normalised.merchant,
          categoryId: normalised.categoryId,
          description: normalised.description,
          date: normalised.date,
          raw: normalised.raw,
          source: SourceType.BASIQ,
        },
      })
      synced++
    }

    if (!user.onboardingCompleted) {
      await this.prisma.user.update({
        where: { clerkId },
        data: { onboardingCompleted: true },
      })
    }

    return { accounts: accounts.length, transactions: synced }
  }
}
