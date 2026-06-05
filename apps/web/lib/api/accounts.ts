export interface Account {
  id: string
  bankName: string
  accountName: string
  balance: number
  last4: string | null
  lastSyncedAt: string | null
  logoUrl: string | null
  status: 'connected' | 'disconnected' | 'syncing'
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
