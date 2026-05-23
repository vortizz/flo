import { Module } from '@nestjs/common'
import { BasiqService } from './basiq.service'

@Module({
  providers: [BasiqService],
  exports: [BasiqService],
})
export class BasiqModule {}
