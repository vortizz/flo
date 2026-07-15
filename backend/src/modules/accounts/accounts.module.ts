import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { AccountsController } from './accounts.controller'
import { AccountsService } from './accounts.service'
import { PrismaModule } from '../../prisma.module'
import { BasiqModule } from '../basiq/basiq.module'
import { SyncService } from './sync.service'

@Module({
  imports: [PrismaModule, BasiqModule, ScheduleModule.forRoot()],
  controllers: [AccountsController],
  providers: [AccountsService, SyncService],
})
export class AccountsModule {}
