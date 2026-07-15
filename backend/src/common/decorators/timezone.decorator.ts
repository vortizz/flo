import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Timezone = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest()
    const tz = req.headers['x-timezone'] as string
    try {
      Intl.DateTimeFormat(undefined, { timeZone: tz })
      return tz
    } catch {
      return 'UTC'
    }
  },
)
