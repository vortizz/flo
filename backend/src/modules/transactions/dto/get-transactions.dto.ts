import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class GetTransactionsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 15

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsIn(['DEBIT', 'CREDIT'])
  type?: 'DEBIT' | 'CREDIT'

  @IsOptional()
  @IsString()
  accountId?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  from?: string

  @IsOptional()
  @IsString()
  to?: string
}
