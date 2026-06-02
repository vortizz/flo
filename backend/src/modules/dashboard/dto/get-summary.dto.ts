import { IsIn, IsOptional } from 'class-validator'

export type Period = 'week' | 'fortnight' | 'month' | 'year'

export class GetSummaryDto {
  @IsOptional()
  @IsIn(['week', 'fortnight', 'month', 'year'])
  period: Period = 'week'
}
