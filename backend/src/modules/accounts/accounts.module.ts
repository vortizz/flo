import { Module } from '@nestjs/common'
import { AccountsController } from './accounts.controller'
import { AccountsService } from './accounts.service'
import { PrismaModule } from '../../prisma.module'
import { BasiqModule } from '../basiq/basiq.module'

@Module({
  imports: [PrismaModule, BasiqModule],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
