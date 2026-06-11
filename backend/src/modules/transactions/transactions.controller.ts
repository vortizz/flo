import { Controller, Get, Query } from '@nestjs/common'
import { GetTransactionsDto } from './dto/get-transactions.dto'
import { TransactionsService } from './transactions.service'
import { Timezone } from 'src/common/decorators/timezone.decorator'
import { User } from 'src/common/decorators/user.decorator'
import type { ClerkUser } from 'src/common/types'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  getTransactions(
    @Query() query: GetTransactionsDto,
    @User() user: ClerkUser,
    @Timezone() tz: string,
  ) {
    return this.transactionsService.getTransactions(user.userId, query, tz)
  }

  @Get('filter-options')
  getFilterOptions(@User() user: ClerkUser) {
    return this.transactionsService.getFilterOptions(user.userId)
  }
}
