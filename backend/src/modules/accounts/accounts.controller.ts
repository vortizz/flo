import { Controller, Delete, Get, Param, Post, Request } from '@nestjs/common'
import { AccountsService } from './accounts.service'

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  getAccounts(@Request() req: any) {
    return this.accountsService.getAccounts(req.user.userId)
  }

  @Delete(':id')
  deleteAccount(@Param('id') id: string, @Request() req: any) {
    return this.accountsService.deleteAccount(req.user.userId, id)
  }

  @Post(':id/sync')
  syncAccount(@Param('id') id: string, @Request() req: any) {
    return this.accountsService.syncAccount(req.user.userId, id)
  }

  @Post('sync-all')
  syncAllAccounts(@Request() req: any) {
    return this.accountsService.syncAllAccounts(req.user.userId)
  }
}
