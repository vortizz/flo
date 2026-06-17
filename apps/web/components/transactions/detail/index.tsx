'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@clerk/nextjs'
import { useQueryClient } from '@tanstack/react-query'
import {
  type Transaction,
  deleteManualTransaction,
  updateManualTransaction,
  type ManualTransactionData,
} from '@/lib/api/transactions'
import { type CategoriesResponse } from '@/lib/api/categories'
import ViewMode from './ViewMode'
import EditMode from './EditMode'
import DeleteConfirm from './DeleteConfirm'
import { type Mode } from './utils'

interface TransactionDetailPanelProps {
  transaction: Transaction
  onClose: () => void
}

export default function TransactionDetailPanel({
  transaction: tx,
  onClose,
}: TransactionDetailPanelProps) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [mode, setMode] = useState<Mode>('view')
  const [localTx, setLocalTx] = useState<Transaction>(tx)

  async function handleSave(data: ManualTransactionData) {
    await updateManualTransaction(localTx.id, data, getToken)
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['accounts'] })

    const categoriesData = queryClient.getQueryData<CategoriesResponse>([
      'categories',
    ])
    const allCategories = [
      ...(categoriesData?.expense ?? []),
      ...(categoriesData?.income ?? []),
    ]
    const matched = allCategories.find(c => c.id === data.categoryId)

    setLocalTx(prev => ({
      ...prev,
      type: data.type,
      amount: data.amount,
      merchant: data.merchant,
      category: matched?.name ?? prev.category,
      categoryId: data.categoryId ?? prev.categoryId,
      categoryColor: matched?.color ?? prev.categoryColor,
      categoryIcon: matched?.icon ?? prev.categoryIcon,
      description: data.description ?? '',
      date: data.date,
    }))
  }

  async function handleDelete() {
    await deleteManualTransaction(localTx.id, getToken)
    queryClient.invalidateQueries({ queryKey: ['transactions'] })
    queryClient.invalidateQueries({ queryKey: ['accounts'] })
    onClose()
  }

  return (
    <div
      className="border-l border-[#2dd4bf]/10 flex flex-col shadow-2xl overflow-hidden w-full h-full min-h-full"
      style={{
        background: 'linear-gradient(170deg, #0d1f2d 0%, #080f18 100%)',
      }}
    >
      <AnimatePresence mode="wait">
        {mode === 'view' && (
          <motion.div
            key="view"
            className="flex flex-col h-full"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ViewMode
              tx={localTx}
              onEdit={() => setMode('edit')}
              onDelete={() => setMode('delete')}
              onClose={onClose}
            />
          </motion.div>
        )}

        {mode === 'edit' && (
          <motion.div
            key="edit"
            className="flex flex-col h-full"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <EditMode
              tx={localTx}
              onSave={handleSave}
              onCancel={() => setMode('view')}
            />
          </motion.div>
        )}

        {mode === 'delete' && (
          <motion.div
            key="delete"
            className="flex flex-col h-full"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <DeleteConfirm
              onConfirm={handleDelete}
              onCancel={() => setMode('view')}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
