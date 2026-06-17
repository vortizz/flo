export interface Category {
  id: string
  name: string
  color: string
  icon: string
}

export interface CategoriesResponse {
  expense: Category[]
  income: Category[]
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
