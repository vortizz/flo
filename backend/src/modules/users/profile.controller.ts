import { Controller, Patch, Body, Post, Get } from '@nestjs/common'
import { UsersService } from './users.service'
import { User } from 'src/common/decorators/user.decorator'
import type { ClerkUser } from 'src/common/types'

@Controller('users')
export class ProfileController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@User() user: ClerkUser) {
    const clerkId = user.userId
    return this.usersService.findByClerkId(clerkId)
  }

  @Patch('mobile')
  async updateMobile(
    @User() user: ClerkUser,
    @Body() body: { mobile: string },
  ) {
    const clerkId = user.userId
    return this.usersService.updateMobile(clerkId, body.mobile)
  }

  @Post('skip-onboarding')
  async skipOnboarding(@User() user: ClerkUser) {
    const clerkId = user.userId
    return this.usersService.updateUser(clerkId, { onboardingCompleted: true })
  }
}
