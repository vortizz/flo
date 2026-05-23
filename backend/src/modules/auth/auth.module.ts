import { Module } from '@nestjs/common'
import { ClerkAuthGuard } from './clerk.guard'
import { Reflector } from '@nestjs/core'

@Module({
  providers: [ClerkAuthGuard, Reflector],
  exports: [ClerkAuthGuard],
})
export class AuthModule {}
