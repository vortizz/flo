'use client'

import CategoryChart from '@/components/dashboard/categories/CategoryChart'
import CashflowChart from '@/components/dashboard/chart/CashflowChart'
import SummaryCards from '@/components/dashboard/summary/SummaryCards'
import RecentTransactions from '@/components/dashboard/transactions/RecentTransactions'
import AccountsCard from '@/components/dashboard/accounts/AccountsCard'
import { useDashboard } from '@/components/dashboard/layout/DashboardContext'

export default function DashboardPage() {
  const { period } = useDashboard()

  return (
    <div className="dashboard-content space-y-3">
      <SummaryCards />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div key={period} className="xl:col-span-2 flex flex-col">
          <CashflowChart className="flex-1" />
        </div>
        <CategoryChart />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AccountsCard />
        <RecentTransactions />
      </div>
    </div>
  )
}
