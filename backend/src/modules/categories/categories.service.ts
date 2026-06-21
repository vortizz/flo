import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'
import { CreateUserCategoryDto } from './dto/create-user-category.dto'
import { UpdateUserCategoryDto } from './dto/update-user-category.dto'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories(clerkId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const categories = await this.prisma.category.findMany({
      where: {
        OR: [{ userId: null }, { userId: user.id }],
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        type: true,
        color: true,
        icon: true,
        userId: true,
        _count: {
          select: { transactions: true },
        },
      },
    })

    const system = categories.filter(c => c.userId === null)
    const userCategories = categories.filter(c => c.userId === user.id)

    const mapCategory = (c: (typeof categories)[0]) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      color: c.color,
      icon: c.icon,
      userId: c.userId,
      transactionCount: c.userId ? c._count.transactions : undefined,
    })

    return {
      expense: [
        ...userCategories.filter(c => c.type === 'DEBIT').map(mapCategory),
        ...system.filter(c => c.type === 'DEBIT').map(mapCategory),
      ],
      income: [
        ...userCategories.filter(c => c.type === 'CREDIT').map(mapCategory),
        ...system.filter(c => c.type === 'CREDIT').map(mapCategory),
      ],
    }
  }

  async createUserCategory(clerkId: string, dto: CreateUserCategoryDto) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    return this.prisma.category.create({
      data: {
        userId: user.id,
        name: dto.name,
        type: dto.type,
        color: dto.color,
        icon: dto.icon,
      },
      select: { id: true, name: true, type: true, color: true, icon: true },
    })
  }

  async updateUserCategory(
    clerkId: string,
    categoryId: string,
    dto: UpdateUserCategoryDto,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    })

    if (!category) throw new NotFoundException('Category not found')
    if (category.userId !== user.id)
      throw new ForbiddenException('Cannot edit system categories')

    return this.prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.type && { type: dto.type }),
        ...(dto.color && { color: dto.color }),
        ...(dto.icon && { icon: dto.icon }),
      },
      select: { id: true, name: true, type: true, color: true, icon: true },
    })
  }

  async deleteUserCategory(clerkId: string, categoryId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { clerkId },
    })

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId, userId: user.id },
    })

    if (!category) throw new NotFoundException('Category not found')
    if (category.userId !== user.id)
      throw new ForbiddenException('Cannot delete system categories')

    const transactionCount = await this.prisma.transaction.count({
      where: { categoryId },
    })

    if (transactionCount > 0) {
      throw new ConflictException({
        message: `This category is used by ${transactionCount} transaction${transactionCount !== 1 ? 's' : ''}. Reassign them before deleting.`,
        transactionCount,
      })
    }

    await this.prisma.category.delete({ where: { id: categoryId } })

    return { success: true }
  }
}
