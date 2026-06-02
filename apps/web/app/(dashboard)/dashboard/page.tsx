'use client'

import SummaryCards from '@/components/dashboard/summary/SummaryCards'
import { useUser } from '@clerk/nextjs'

export default function DashboardPage() {
  const { user } = useUser()

  return (
    <div className="dashboard-content">
      <SummaryCards />
    </div>
  )
}
