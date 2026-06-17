import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/prisma.service'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async getCategories() {
    const categories = await this.prisma.category.findMany({
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, type: true, color: true, icon: true },
    })

    return {
      expense: categories.filter(c => c.type === 'DEBIT'),
      income: categories.filter(c => c.type === 'CREDIT'),
    }
  }
}
