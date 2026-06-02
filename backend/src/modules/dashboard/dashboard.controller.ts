import { Controller, Get, Query, Request } from '@nestjs/common'
import { DashboardService } from './dashboard.service'
import { GetSummaryDto } from './dto/get-summary.dto'

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Query() query: GetSummaryDto, @Request() req: any) {
    return this.dashboardService.getSummary(req.user.userId, query.period)
  }

  @Get('chart')
  getChart(@Query() query: GetSummaryDto, @Request() req: any) {
    return this.dashboardService.getChart(req.user.userId, query.period)
  }
}
