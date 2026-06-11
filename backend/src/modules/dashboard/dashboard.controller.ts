import { Controller, Get, Query, Request } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { GetSummaryDto } from './dto/get-summary.dto'
import { Timezone } from 'src/common/decorators/timezone.decorator'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(
    @Query() query: GetSummaryDto,
    @Request() req: any,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getSummary(
      req.user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('chart')
  getChart(
    @Query() query: GetSummaryDto,
    @Request() req: any,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getChart(
      req.user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('chart/summary')
  getChartSummary(
    @Query() query: GetSummaryDto,
    @Request() req: any,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getChartSummary(
      req.user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('categories')
  getCategories(
    @Query() query: GetSummaryDto,
    @Request() req: any,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getCategories(
      req.user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('recent-transactions')
  getRecentTransactions(
    @Query() query: GetSummaryDto,
    @Request() req: any,
    @Timezone() tz: string,
  ) {
    return this.dashboardService.getRecentTransactions(
      req.user.userId,
      query.period,
      query.from,
      query.to,
      tz,
    )
  }

  @Get('accounts')
  getDashboardAccounts(@Request() req: any, @Timezone() tz: string) {
    return this.dashboardService.getDashboardAccounts(req.user.userId, tz)
  }
}
