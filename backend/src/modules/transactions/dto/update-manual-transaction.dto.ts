import { IsIn, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateManualTransactionDto {
  @IsOptional()
  @IsIn(['DEBIT', 'CREDIT'])
  type?: 'DEBIT' | 'CREDIT'

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(99999)
  amount?: number

  @IsOptional()
  @IsString()
  merchant?: string

  @IsOptional()
  @IsString()
  categoryId?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  date?: string
}
