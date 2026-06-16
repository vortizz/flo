import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateManualTransactionDto {
  @IsIn(['DEBIT', 'CREDIT'])
  type!: 'DEBIT' | 'CREDIT'

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  @Max(99999)
  amount!: number

  @IsNotEmpty()
  @IsString()
  merchant!: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsNotEmpty()
  @IsString()
  date!: string
}
