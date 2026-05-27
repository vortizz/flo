import {
  Controller,
  Post,
  Headers,
  Body,
  BadRequestException,
  Logger,
  Req,
} from '@nestjs/common'
import type { RawBodyRequest } from '@nestjs/common'
import { UsersService } from './users.service'
import { ConfigService } from '@nestjs/config'
import { Webhook } from 'svix'
import { Public } from '../auth/auth.decorator'
import { FastifyRequest } from 'fastify'

interface ClerkUserCreatedEvent {
  type: string
  data: {
    id: string
    email_addresses: Array<{
      email_address: string
      id: string
    }>
    primary_email_address_id: string
    first_name: string | null
    last_name: string | null
    image_url: string | null
    phone_numbers: Array<{
      phone_number: string
      id: string
    }>
    primary_phone_number_id: string | null
  }
}

@Controller('webhooks')
export class UsersController {
  private readonly logger = new Logger(UsersController.name)

  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('clerk')
  async handleClerkWebhook(
    @Headers('svix-id') svixId: string,
    @Headers('svix-timestamp') svixTimestamp: string,
    @Headers('svix-signature') svixSignature: string,
    @Req() req: RawBodyRequest<FastifyRequest>,
    @Body() body: ClerkUserCreatedEvent,
  ) {
    const webhookSecret = this.configService.get<string>(
      'app.clerkWebhookSecret',
    )

    if (!webhookSecret) {
      this.logger.error('CLERK_WEBHOOK_SECRET is not set')
      throw new BadRequestException('Webhook secret not configured')
    }

    if (!svixId || !svixTimestamp || !svixSignature) {
      throw new BadRequestException('Missing svix headers')
    }

    const wh = new Webhook(webhookSecret)
    let event: ClerkUserCreatedEvent

    try {
      const rawBody = req.rawBody?.toString() || JSON.stringify(body)
      event = wh.verify(rawBody, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      }) as ClerkUserCreatedEvent
    } catch (err) {
      this.logger.error(`Webhook verification failed: ${err}`)
      throw new BadRequestException('Invalid webhook signature')
    }

    if (event.type === 'user.created') {
      const {
        id,
        email_addresses,
        primary_email_address_id,
        first_name,
        last_name,
        image_url,
        phone_numbers,
        primary_phone_number_id,
      } = event.data

      const primaryEmail = email_addresses.find(
        e => e.id === primary_email_address_id,
      )

      if (!primaryEmail) {
        throw new BadRequestException('No primary email found')
      }

      const primaryPhone = phone_numbers?.find(
        p => p.id === primary_phone_number_id,
      )

      const fullName =
        [first_name, last_name].filter(Boolean).join(' ') || 'Flo User'

      await this.usersService.createUser({
        clerkId: id,
        email: primaryEmail.email_address,
        fullName,
        avatarUrl: image_url || undefined,
        mobile: primaryPhone?.phone_number || undefined,
      })

      this.logger.log(`User created from webhook: ${id}`)
    }

    // if (event.type === 'user.updated') {
    //   const {
    //     id,
    //     first_name,
    //     last_name,
    //     image_url,
    //     phone_numbers,
    //     primary_phone_number_id,
    //   } = event.data

    //   const primaryPhone = phone_numbers?.find(
    //     p => p.id === primary_phone_number_id,
    //   )

    //   await this.usersService.updateUser(id, {
    //     fullName:
    //       [first_name, last_name].filter(Boolean).join(' ') || undefined,
    //     avatarUrl: image_url || undefined,
    //     mobile: primaryPhone?.phone_number || undefined,
    //   })

    //   this.logger.log(`User updated from webhook: ${id}`)
    // }

    return { received: true }
  }
}
