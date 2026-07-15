export interface Account {
  id: string
  bankName: string
  accountName: string
  balance: number
  last4: string | null
  lastSyncedAt: string | null
  logoUrl: string | null
  status: 'connected' | 'disconnected' | 'syncing'
  isCash: boolean
  accountType: string | null
}

export interface AccountDetail {
  id: string
  bankName: string
  accountName: string
  balance: number
  last4: string | null
  lastSyncedAt: string | null
  logoUrl: string | null
  status: 'connected' | 'disconnected'
  isCash: boolean
  accountType: string | null
}

export interface BalanceHistoryPoint {
  date: string
  balance: number
}

export interface AccountsSummary {
  totalBalance: number
  totalAccounts: number
  lastSyncedAt: string | null
}

export interface AccountsResponse {
  summary: AccountsSummary
  accounts: Account[]
}

export async function fetchAccounts(
  getToken: () => Promise<string | null>,
): Promise<AccountsResponse> {
  const token = await getToken()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch accounts')
  return res.json()
}

export async function fetchAccountDetail(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<AccountDetail> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/${id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (!res.ok) throw new Error('Failed to fetch account detail')
  return res.json()
}

export async function fetchBalanceHistory(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<BalanceHistoryPoint[]> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/${id}/balance-history`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
  )
  if (!res.ok) throw new Error('Failed to fetch balance history')
  return res.json()
}

export async function deleteAccount(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<void> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/${id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (!res.ok) throw new Error('Failed to disconnect account')
}

export async function syncAccount(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<{ synced: number }> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/${id}/sync`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (!res.ok) throw new Error('Failed to sync account')
  return res.json()
}

export async function syncAllAccounts(
  getToken: () => Promise<string | null>,
): Promise<{ synced: number; failed: number }> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/sync-all`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (!res.ok) throw new Error('Failed to sync all accounts')
  return res.json()
}
