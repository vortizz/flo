import { Controller, Get, Query } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { GetSummaryDto } from './dto/get-summary.dto'
import { Timezone } from 'src/common/decorators/timezone.decorator'
import { User } from 'src/common/decorators/user.decorator'
import type { ClerkUser } from 'src/common/types'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(
    @Query() query: GetSummaryDto,
    @User() user: ClerkUser,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getSummary(
      user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('chart')
  getChart(
    @Query() query: GetSummaryDto,
    @User() user: ClerkUser,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getChart(
      user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('chart/summary')
  getChartSummary(
    @Query() query: GetSummaryDto,
    @User() user: ClerkUser,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getChartSummary(
      user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('categories')
  getCategories(
    @Query() query: GetSummaryDto,
    @User() user: ClerkUser,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getCategories(
      user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('recent-transactions')
  getRecentTransactions(
    @Query() query: GetSummaryDto,
    @User() user: ClerkUser,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getRecentTransactions(
      user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('accounts')
  getDashboardAccounts(@User() user: ClerkUser, @Timezone() tz: string) {
    return this.dashboardService.getDashboardAccounts(user.userId, tz)
  }
}
