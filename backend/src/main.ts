import { NestFactory } from '@nestjs/core'
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import fastifyHelmet from '@fastify/helmet'
import fastifyCookie from '@fastify/cookie'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
    { rawBody: true },
  )

  await app.register(fastifyHelmet)
  await app.register(fastifyCookie)

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const configService = app.get(ConfigService)
  const port = configService.get<number>('app.port') || 4000
  const corsOrigin =
    configService.get<string>('app.corsOrigin') || 'http://localhost:3000'

  app.enableCors({
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-timezone',
      'x-basiq-signature',
    ],
    credentials: true,
  })

  app.setGlobalPrefix('api')

  await app.listen(port, '0.0.0.0')
}

bootstrap()
