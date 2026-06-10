'use client'

import CategoryChart from '@/components/dashboard/categories/CategoryChart'
import CashflowChart from '@/components/dashboard/chart/CashflowChart'
import SummaryCards from '@/components/dashboard/summary/SummaryCards'
import RecentTransactions from '@/components/dashboard/transactions/RecentTransactions'
import AccountsCard from '@/components/dashboard/accounts/AccountsCard'

export default function DashboardPage() {
  return (
    <div className="dashboard-content space-y-3">
      <SummaryCards />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <CashflowChart />
        <CategoryChart />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AccountsCard />
        <RecentTransactions />
      </div>
    </div>
  )
}
