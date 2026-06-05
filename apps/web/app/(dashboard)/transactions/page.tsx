import { Suspense } from 'react'
import TransactionsTable from '@/components/transactions/TransactionsTable'

export default function TransactionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <Suspense>
        <TransactionsTable />
      </Suspense>
    </div>
  )
}
