import { Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { User } from 'src/common/decorators/user.decorator'
import type { ClerkUser } from 'src/common/types'
import { Timezone } from 'src/common/decorators/timezone.decorator'

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  getAccounts(@User() user: ClerkUser) {
    return this.accountsService.getAccounts(user.userId)
  }

  @Post('sync-all')
  syncAllAccounts(@User() user: ClerkUser) {
    return this.accountsService.syncAllAccounts(user.userId)
  }

  @Get(':id')
  getAccountDetail(@Param('id') id: string, @User() user: ClerkUser) {
    return this.accountsService.getAccountDetail(user.userId, id)
  }

  @Get(':id/balance-history')
  getBalanceHistory(
    @Param('id') id: string,
    @User() user: ClerkUser,
    @Timezone() tz: string,
  ) {
    return this.accountsService.getBalanceHistory(user.userId, id, tz)
  }

  @Delete(':id')
  deleteAccount(@Param('id') id: string, @User() user: ClerkUser) {
    return this.accountsService.deleteAccount(user.userId, id)
  }

  @Post(':id/sync')
  syncAccount(@Param('id') id: string, @User() user: ClerkUser) {
    return this.accountsService.syncAccount(user.userId, id)
  }
}
