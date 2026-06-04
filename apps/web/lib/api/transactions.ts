export interface Transaction {
  id: string
  merchant: string
  description: string | null
  category: string | null
  date: string
  amount: number
  type: 'DEBIT' | 'CREDIT'
  account: string
  accountId: string
}

export interface TransactionsPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface TransactionsResponse {
  data: Transaction[]
  pagination: TransactionsPagination
}

export interface TransactionsParams {
  page?: number
  limit?: number
  search?: string
  type?: 'DEBIT' | 'CREDIT'
  accountId?: string
  category?: string
  from?: string
  to?: string
}

export interface FilterOptions {
  accounts: {
    id: string
    accountName: string
    bankName: string
    last4: string | null
    logoUrl: string | null
  }[]
  categories: string[]
}

export async function fetchTransactions(
  params: TransactionsParams,
  getToken: () => Promise<string | null>,
): Promise<TransactionsResponse> {
  const token = await getToken()
  const query = new URLSearchParams()
  if (params.page) query.set('page', String(params.page))
  if (params.limit) query.set('limit', String(params.limit))
  if (params.search) query.set('search', params.search)
  if (params.type) query.set('type', params.type)
  if (params.accountId) query.set('accountId', params.accountId)
  if (params.category) query.set('category', params.category)
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?${query}`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Failed to fetch transactions')
  return res.json()
}

export async function fetchFilterOptions(
  getToken: () => Promise<string | null>,
): Promise<FilterOptions> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/filter-options`,
    { headers: { Authorization: `Bearer ${token}` } },
  )
  if (!res.ok) throw new Error('Failed to fetch filter options')
  return res.json()
}
