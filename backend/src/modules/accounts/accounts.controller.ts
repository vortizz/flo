import { Controller, Get, Request } from '@nestjs/common'
import { AccountsService } from './accounts.service'

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  getAccounts(@Request() req: any) {
    return this.accountsService.getAccounts(req.user.userId)
  }
}
