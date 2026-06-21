import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { GetTransactionsDto } from './dto/get-transactions.dto'
import { TransactionsService } from './transactions.service'
import { Timezone } from 'src/common/decorators/timezone.decorator'
import { User } from 'src/common/decorators/user.decorator'
import type { ClerkUser } from 'src/common/types'
import { CreateManualTransactionDto } from './dto/create-manual-transaction.dto'
import { UpdateTransactionDto } from './dto/update-transaction.dto'

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

  @Post('manual')
  createManualTransaction(
    @Body() body: CreateManualTransactionDto,
    @User() user: ClerkUser,
  ) {
    return this.transactionsService.createManualTransaction(user.userId, body)
  }

  @Patch(':id')
  updateTransaction(
    @Param('id') id: string,
    @Body() body: UpdateTransactionDto,
    @User() user: ClerkUser,
  ) {
    return this.transactionsService.updateTransaction(user.userId, id, body)
  }

  @Delete(':id')
  deleteManualTransaction(@Param('id') id: string, @User() user: ClerkUser) {
    return this.transactionsService.deleteManualTransaction(user.userId, id)
  }
}
