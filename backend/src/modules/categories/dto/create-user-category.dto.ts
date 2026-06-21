import { IsIn, IsNotEmpty, IsString } from 'class-validator'
import { TransactionType } from '@prisma/client'

export class CreateUserCategoryDto {
  @IsNotEmpty()
  @IsString()
  name!: string

  @IsIn(['DEBIT', 'CREDIT'])
  type!: TransactionType

  @IsNotEmpty()
  @IsString()
  color!: string

  @IsNotEmpty()
  @IsString()
  icon!: string
}
