import { Controller, Patch, Body, Req, Post, Get } from '@nestjs/common'
import { UsersService } from './users.service'

@Controller('users')
export class ProfileController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  async getMe(@Req() req: any) {
    const clerkId = req.user.userId
    return this.usersService.findByClerkId(clerkId)
  }

  @Patch('mobile')
  async updateMobile(@Req() req: any, @Body() body: { mobile: string }) {
    const clerkId = req.user.userId
    return this.usersService.updateMobile(clerkId, body.mobile)
  }

  @Post('skip-onboarding')
  async skipOnboarding(@Req() req: any) {
    const clerkId = req.user.userId
    return this.usersService.updateUser(clerkId, { onboardingCompleted: true })
  }
}
