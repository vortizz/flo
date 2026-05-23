import { registerAs } from '@nestjs/config'

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT || '4000', 10),
  corsOrigin: process.env.FRONTEND_URL || 'http://localhost:3000',
  nodeEnv: process.env.NODE_ENV || 'development',
  clerkSecretKey: process.env.CLERK_SECRET_KEY,
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET,
  basiqApiKey: process.env.BASIQ_API_KEY,
  basiqBaseUrl: process.env.BASIQ_BASE_URL || 'https://au-api.basiq.io',
}))
