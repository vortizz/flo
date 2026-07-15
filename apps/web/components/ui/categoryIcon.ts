import { CATEGORY_ICON_MAP } from '@/constants/categoryIcons'
import type { LucideIcon } from 'lucide-react'

export function getCategoryIcon(name: string | null): LucideIcon | null {
  if (!name) return null
  return CATEGORY_ICON_MAP[name] ?? null
}
