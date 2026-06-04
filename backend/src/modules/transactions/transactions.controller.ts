import { Controller, Get, Query, Request } from '@nestjs/common'
import { GetTransactionsDto } from './dto/get-transactions.dto'
import { TransactionsService } from './transactions.service'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  getTransactions(@Query() query: GetTransactionsDto, @Request() req: any) {
    return this.transactionsService.getTransactions(req.user.userId, query)
  }

  @Get('filter-options')
  getFilterOptions(@Request() req: any) {
    return this.transactionsService.getFilterOptions(req.user.userId)
  }
}
