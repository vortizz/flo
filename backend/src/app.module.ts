import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD } from '@nestjs/core'
import { AppController } from './app.controller'
import { PrismaModule } from './prisma.module'
import { AuthModule } from './modules/auth/auth.module'
import { ClerkAuthGuard } from './modules/auth/clerk.guard'
import { UsersModule } from './modules/users/users.module'
import { BasiqModule } from './modules/basiq/basiq.module'
import appConfig from './config/app.config'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    BasiqModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ClerkAuthGuard,
    },
  ],
})
export class AppModule {}
