import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { SourceType, TransactionType } from '@prisma/client'
import axios, { AxiosInstance } from 'axios'

@Injectable()
export class BasiqService {
  private readonly logger = new Logger(BasiqService.name)
  private axiosInstance: AxiosInstance
  private accessToken: string | null = null
  private tokenExpiry: Date | null = null

  constructor(private configService: ConfigService) {
    const baseUrl = this.configService.get<string>('app.basiqBaseUrl')

    this.axiosInstance = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json',
        'basiq-version': '3.0',
      },
    })
  }

  // Get or refresh access token
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken as string
    }

    const apiKey = this.configService.get<string>('app.basiqApiKey')
    const baseUrl = this.configService.get<string>('app.basiqBaseUrl')

    try {
      const response = await axios.post(
        `${baseUrl}/token`,
        'scope=SERVER_ACCESS',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${apiKey}`,
            'basiq-version': '3.0',
          },
        },
      )

      this.accessToken = response.data.access_token
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000)

      this.logger.log('Basiq access token refreshed')
      return this.accessToken as string
    } catch (error) {
      if (axios.isAxiosError(error)) {
        this.logger.error(
          `Basiq auth failed: ${JSON.stringify(error.response?.data)}`,
        )
        this.logger.error(`Status: ${error.response?.status}`)
        this.logger.error(`API Key exists: ${!!apiKey}`)
        this.logger.error(`API Key length: ${apiKey?.length}`)
      }
      throw error
    }
  }

  // Create a Basiq user for a Flo user
  async createUser(
    email: string,
    mobile: string,
    firstName: string,
  ): Promise<string> {
    const token = await this.getAccessToken()

    try {
      const response = await this.axiosInstance.post(
        '/users',
        { email, mobile, firstName },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      this.logger.log(`Basiq user created: ${response.data.id}`)
      return response.data.id
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        this.logger.log(`Basiq user already exists for ${email}, reusing ID`)
        const existingId = error.response.data?.data?.[0]?.id
        if (existingId) return existingId
      }
      this.logger.error(`Failed to create Basiq user: ${error}`)
      throw error
    }
  }

  async createAuthLink(
    basiqUserId: string,
    mobile: string,
    institutionId?: string,
    bankIndex?: number,
    total?: number,
  ): Promise<string> {
    const token = await this.getAccessToken()

    try {
      const response = await this.axiosInstance.post(
        `/users/${basiqUserId}/auth_link`,
        { mobile },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      const url: string = response.data.links.public

      const params = new URLSearchParams()
      if (institutionId) params.append('institutionId', institutionId)
      params.append(
        'state',
        JSON.stringify({ bankIndex: bankIndex ?? 0, total: total ?? 1 }),
      )

      this.logger.log(`Auth link created for user: ${basiqUserId}`)
      return `${url}?${params.toString()}`
    } catch (error) {
      this.logger.error(`Failed to create auth link: ${error}`)
      throw error
    }
  }

  async getTransactions(basiqUserId: string, fromDate?: string) {
    const token = await this.getAccessToken()

    try {
      const allTransactions: any[] = []
      const date =
        fromDate ??
        new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]

      let url: string | null =
        `/users/${basiqUserId}/transactions?filter=transaction.postDate.gteq('${date}')&limit=500`

      while (url) {
        const response = await this.axiosInstance.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = response.data.data ?? []
        allTransactions.push(...data)

        // Follow pagination
        const next = response.data.links?.next
        if (next) {
          // Extract relative path from full URL
          url = next.replace('https://au-api.basiq.io', '')
        } else {
          url = null
        }
      }

      this.logger.log(
        `Fetched ${allTransactions.length} transactions for user ${basiqUserId}`,
      )
      return allTransactions
    } catch (error) {
      this.logger.error(`Failed to get transactions: ${error}`)
      throw error
    }
  }

  async getJob(jobId: string) {
    const token = await this.getAccessToken()

    try {
      const response = await this.axiosInstance.get(`/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    } catch (error) {
      this.logger.error(`Failed to get job: ${error}`)
      throw error
    }
  }

  async syncAccounts(basiqUserId: string) {
    const token = await this.getAccessToken()

    try {
      const response = await this.axiosInstance.get(
        `/users/${basiqUserId}/accounts`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      this.logger.log(`Accounts response: ${JSON.stringify(response.data)}`)
      return response.data.data
    } catch (error) {
      this.logger.error(`Failed to sync accounts: ${error}`)
      throw error
    }
  }

  normaliseTransaction(tx: any, accountId: string) {
    const merchant =
      tx.enrich?.merchant?.businessName ??
      tx.enrich?.cleanDescription ??
      tx.description ??
      'Unknown'

    const category = tx.enrich?.category?.anzsic?.class?.title ?? null

    const date = tx.transactionDate
      ? new Date(tx.transactionDate)
      : new Date(tx.postDate)

    const type: TransactionType =
      tx.direction === 'credit' ? TransactionType.CREDIT : TransactionType.DEBIT

    const amount = Math.abs(parseFloat(tx.amount))

    return {
      basiqId: tx.id,
      accountId,
      amount,
      type,
      merchant,
      category,
      description: tx.description ?? null,
      date,
      raw: tx,
      source: SourceType.BASIQ,
    }
  }
}
