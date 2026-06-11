import { Controller, Delete, Get, Param, Post } from '@nestjs/common'
import { AccountsService } from './accounts.service'
import { User } from 'src/common/decorators/user.decorator'
import type { ClerkUser } from 'src/common/types'

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  getAccounts(@User() user: ClerkUser) {
    return this.accountsService.getAccounts(user.userId)
  }

  @Delete(':id')
  deleteAccount(@Param('id') id: string, @User() user: ClerkUser) {
    return this.accountsService.deleteAccount(user.userId, id)
  }

  @Post(':id/sync')
  syncAccount(@Param('id') id: string, @User() user: ClerkUser) {
    return this.accountsService.syncAccount(user.userId, id)
  }

  @Post('sync-all')
  syncAllAccounts(@User() user: ClerkUser) {
    return this.accountsService.syncAllAccounts(user.userId)
  }
}
