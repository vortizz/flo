export interface Transaction {
  id: string
  merchant: string
  description: string | null
  category: string | null
  categoryId: string | null
  categoryColor: string | null
  categoryIcon: string | null
  date: string
  amount: number
  type: 'DEBIT' | 'CREDIT'
  account: string
  accountId: string
  isCash: boolean
  logoUrl: string | null
  last4: string | null
  source: 'BASIQ' | 'MANUAL'
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
  categoryId?: string
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
    isCash: boolean
  }[]
  categories: {
    id: string
    name: string
    color: string
    icon: string
  }[]
}

export interface ManualTransactionData {
  type: 'DEBIT' | 'CREDIT'
  amount: number
  merchant: string
  categoryId?: string
  description?: string
  date: string
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
  if (params.categoryId) query.set('categoryId', params.categoryId)
  if (params.from) query.set('from', params.from)
  if (params.to) query.set('to', params.to)

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions?${query}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
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

export async function createManualTransaction(
  data: ManualTransactionData,
  getToken: () => Promise<string | null>,
): Promise<Transaction> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/manual`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) throw new Error('Failed to create transaction')
  return res.json()
}

export async function updateManualTransaction(
  id: string,
  data: Partial<ManualTransactionData>,
  getToken: () => Promise<string | null>,
): Promise<Transaction> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) throw new Error('Failed to update transaction')
  return res.json()
}

export async function deleteManualTransaction(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/transactions/${id}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
  )
  if (!res.ok) throw new Error('Failed to delete transaction')
}
