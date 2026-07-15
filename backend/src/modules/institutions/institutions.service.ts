import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.institution.findMany({
      where: { isActive: true },
      orderBy: [{ isPopular: 'desc' }, { name: 'asc' }],
      select: {
        id: true,
        name: true,
        shortName: true,
        institutionType: true,
        logoUrl: true,
        isPopular: true,
      },
    })
  }
}
