import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { ClerkUser } from '../types'

export const User = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ClerkUser => {
    const req = ctx.switchToHttp().getRequest()
    return req.user
  },
)
