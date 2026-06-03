import { IsDateString, IsIn, IsOptional } from 'class-validator'

export type Period = 'week' | 'fortnight' | 'month' | 'year' | 'custom'

export class GetSummaryDto {
  @IsOptional()
  @IsIn(['week', 'fortnight', 'month', 'year', 'custom'])
  period: Period = 'week'

  @IsOptional()
  @IsDateString()
  from?: string

  @IsOptional()
  @IsDateString()
  to?: string
}
