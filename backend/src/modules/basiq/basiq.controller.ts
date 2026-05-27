import {
  Body,
  Controller,
  Post,
  Req,
  NotFoundException,
  BadRequestException,
  Get,
  Param,
} from '@nestjs/common'
import { BasiqService } from './basiq.service'
import { PrismaService } from '../../prisma.service'

@Controller('basiq')
export class BasiqController {
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
      const basiqUserId = await this.basiqService.createUser(user.email)
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

    const accounts = await this.basiqService.syncAccounts(user.basiqUserId)

    // Upsert accounts into Flo's DB
    for (const account of accounts) {
      await this.prisma.account.upsert({
        where: { basiqId: account.id },
        update: {
          balance: account.balance,
          lastSyncedAt: new Date(),
        },
        create: {
          userId: user.id,
          basiqId: account.id,
          bankName: account.institution,
          accountName: account.name,
          balance: account.balance ?? 0,
          lastSyncedAt: new Date(),
        },
      })
    }

    await this.prisma.user.update({
      where: { clerkId },
      data: { onboardingCompleted: true },
    })

    return { synced: accounts.length }
  }
}
