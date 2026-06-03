'use client'

import CategoryChart from '@/components/dashboard/categories/CategoryChart'
import CashflowChart from '@/components/dashboard/chart/CashflowChart'
import SummaryCards from '@/components/dashboard/summary/SummaryCards'
import RecentTransactions from '@/components/dashboard/transactions/RecentTransactions'
import { useUser } from '@clerk/nextjs'

export default function DashboardPage() {
  const { user } = useUser()

  return (
    <div className="dashboard-content space-y-3">
      <SummaryCards />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CashflowChart />
        <CategoryChart />
      </div>
      <RecentTransactions />
    </div>
  )
}
