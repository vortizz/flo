import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verifyToken } from '@clerk/backend'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from './auth.decorator'

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers['authorization']

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing authorization token')
    }

    const token = authHeader.split(' ')[1]

    try {
      const payload = await verifyToken(token, {
        secretKey: this.configService.get<string>('app.clerkSecretKey'),
      })
      request.user = {
        userId: payload.sub,
        sessionId: payload.sid,
      }
      return true
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }
  }
}
