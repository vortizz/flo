import { Module } from '@nestjs/common'
import { BasiqService } from './basiq.service'
import { BasiqController } from './basiq.controller'
import { PrismaService } from '../../prisma.service'

@Module({
  controllers: [BasiqController],
  providers: [BasiqService, PrismaService],
  exports: [BasiqService],
})
export class BasiqModule {}
