import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../../prisma.service'
import { AccountStatus } from '@prisma/client'
import { AccountsService } from './accounts.service'

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly accountsService: AccountsService,
  ) {}

  @Cron('0 */15 * * * *')
  async cronSyncAll() {
    this.logger.log('Cron sync started')

    const users = await this.prisma.user.findMany({
      where: {
        basiqUserId: { not: null },
        accounts: {
          some: { status: AccountStatus.CONNECTED },
        },
      },
      select: { clerkId: true, id: true },
    })

    this.logger.log(`Cron sync: found ${users.length} users to sync`)

    for (const user of users) {
      const accounts = await this.prisma.account.findMany({
        where: {
          userId: user.id,
          status: AccountStatus.CONNECTED,
          isCash: false,
        },
        select: { id: true },
      })

      const results = await Promise.allSettled(
        accounts.map(a => this.accountsService.syncAccount(user.clerkId, a.id)),
      )

      const synced = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      results
        .filter(r => r.status === 'rejected')
        .forEach(r =>
          this.logger.error(
            `Cron sync failed for account: ${(r as PromiseRejectedResult).reason}`,
          ),
        )

      this.logger.log(
        `Cron sync user ${user.id}: ${synced} accounts synced, ${failed} failed`,
      )
    }

    this.logger.log('Cron sync completed')
  }
}
