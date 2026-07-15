import { IsIn, IsOptional, IsString } from 'class-validator'
import { TransactionType } from '@prisma/client'

export class UpdateUserCategoryDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsIn(['DEBIT', 'CREDIT'])
  type?: TransactionType

  @IsOptional()
  @IsString()
  color?: string

  @IsOptional()
  @IsString()
  icon?: string
}
