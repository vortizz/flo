export interface Category {
  id: string
  name: string
  type: 'DEBIT' | 'CREDIT'
  color: string
  icon: string
  userId?: string | null
  transactionCount?: number
}

export interface CategoriesResponse {
  expense: Category[]
  income: Category[]
}

export interface CreateUserCategoryData {
  name: string
  type: 'DEBIT' | 'CREDIT'
  color: string
  icon: string
}

export interface UpdateUserCategoryData {
  name?: string
  type?: 'DEBIT' | 'CREDIT'
  color?: string
  icon?: string
}

export async function fetchCategories(
  getToken: () => Promise<string | null>,
): Promise<CategoriesResponse> {
  const token = await getToken()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch categories')
  return res.json()
}

export async function createUserCategory(
  data: CreateUserCategoryData,
  getToken: () => Promise<string | null>,
): Promise<Category> {
  const token = await getToken()
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create category')
  return res.json()
}

export async function updateUserCategory(
  id: string,
  data: UpdateUserCategoryData,
  getToken: () => Promise<string | null>,
): Promise<Category> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    },
  )
  if (!res.ok) throw new Error('Failed to update category')
  return res.json()
}

export async function deleteUserCategory(
  id: string,
  getToken: () => Promise<string | null>,
): Promise<{ success: boolean } | { transactionCount: number }> {
  const token = await getToken()
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories/${id}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    },
  )
  if (res.status === 409) return res.json()
  if (!res.ok) throw new Error('Failed to delete category')
  return res.json()
}
