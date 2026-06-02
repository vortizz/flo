'use client'

import CashflowChart from '@/components/dashboard/chart/CashflowChart'
import SummaryCards from '@/components/dashboard/summary/SummaryCards'
import { useUser } from '@clerk/nextjs'

export default function DashboardPage() {
  const { user } = useUser()

  return (
    <div className="dashboard-content space-y-3">
      <SummaryCards />
      <CashflowChart />
    </div>
  )
}
