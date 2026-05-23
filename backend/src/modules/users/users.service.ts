import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../../prisma.service'

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(private prisma: PrismaService) {}

  async createUser(data: {
    clerkId: string
    email: string
    fullName: string
    avatarUrl?: string
  }) {
    try {
      const user = await this.prisma.user.upsert({
        where: { clerkId: data.clerkId },
        update: {},
        create: {
          clerkId: data.clerkId,
          email: data.email,
          fullName: data.fullName,
          avatarUrl: data.avatarUrl,
        },
      })
      this.logger.log(`User created/found: ${user.id}`)
      return user
    } catch (error) {
      this.logger.error(`Failed to create user: ${error}`)
      throw error
    }
  }

  async findByClerkId(clerkId: string) {
    return this.prisma.user.findUnique({
      where: { clerkId },
    })
  }
}
