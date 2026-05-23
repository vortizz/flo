import { Controller, Get, Req } from '@nestjs/common'
import { Public } from './modules/auth/auth.decorator'

@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      app: 'Flo API',
      timestamp: new Date().toISOString(),
    }
  }

  @Get('me')
  me(@Req() req: { user: { userId: string; sessionId: string } }) {
    return req.user
  }
}
