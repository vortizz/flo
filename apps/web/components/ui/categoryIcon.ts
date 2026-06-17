import * as icons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export function getCategoryIcon(name: string | null): LucideIcon | null {
  if (!name) return null
  return (icons as unknown as Record<string, LucideIcon>)[name] ?? null
}
