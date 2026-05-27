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
    mobile?: string
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
          mobile: data.mobile,
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

  async updateUser(
    clerkId: string,
    data: Partial<{
      fullName: string
      avatarUrl: string
      mobile: string
      onboardingCompleted: boolean
    }>,
  ) {
    return this.prisma.user.update({
      where: { clerkId },
      data,
    })
  }

  async updateMobile(clerkId: string, mobile: string) {
    return this.prisma.user.update({
      where: { clerkId },
      data: { mobile },
    })
  }
}
