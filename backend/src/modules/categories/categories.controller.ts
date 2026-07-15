import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { CategoriesService } from './categories.service'
import { User } from 'src/common/decorators/user.decorator'
import type { ClerkUser } from 'src/common/types'
import { UpdateUserCategoryDto } from './dto/update-user-category.dto'
import { CreateUserCategoryDto } from './dto/create-user-category.dto'

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  getCategories(@User() user: ClerkUser) {
    return this.categoriesService.getCategories(user.userId)
  }

  @Post()
  createUserCategory(
    @User() user: ClerkUser,
    @Body() dto: CreateUserCategoryDto,
  ) {
    return this.categoriesService.createUserCategory(user.userId, dto)
  }

  @Patch(':id')
  updateUserCategory(
    @User() user: ClerkUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserCategoryDto,
  ) {
    return this.categoriesService.updateUserCategory(user.userId, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deleteUserCategory(@User() user: ClerkUser, @Param('id') id: string) {
    return this.categoriesService.deleteUserCategory(user.userId, id)
  }
}
