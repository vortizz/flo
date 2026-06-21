'use client'

import { useState, createElement } from 'react'
import { Plus, Pencil, Trash2, Tag, AlertTriangle } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import {
  fetchCategories,
  deleteUserCategory,
  createUserCategory,
  updateUserCategory,
  type Category,
  type CreateUserCategoryData,
  type UpdateUserCategoryData,
} from '@/lib/api/categories'
import { getCategoryIcon } from '@/components/ui/categoryIcon'
import CategoryModal from '@/components/categories/CategoryModal'
import { Toast } from '@/components/ui/Toast'
import ConfirmModal from '@/components/settings/ConfirmModal'

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: Category
  onEdit: (c: Category) => void
  onDelete: (c: Category) => void
}) {
  const Icon = getCategoryIcon(category.icon)

  return (
    <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[#ffffff04] border border-[#1a2d3d]">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${category.color}20` }}
        >
          {Icon
            ? createElement(Icon, {
                size: 16,
                style: { color: category.color },
              })
            : null}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">
            {category.name}
          </p>
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
              category.type === 'DEBIT'
                ? 'bg-red-500/10 text-red-400'
                : 'bg-[#00C896]/10 text-[#00C896]'
            }`}
          >
            {category.type === 'DEBIT' ? 'Expense' : 'Income'}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(category)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8b949e] hover:text-white hover:bg-white/5 transition-colors"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(category)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#8b949e] hover:text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function DeleteBlockedRow({
  category,
  transactionCount,
  onCancel,
}: {
  category: Category
  transactionCount: number
  onCancel: () => void
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 rounded-xl border border-red-500/20 bg-red-500/5">
      <AlertTriangle size={16} className="text-red-400 shrink-0" />
      <p className="text-xs text-red-400 flex-1">
        <span className="font-semibold">{category.name}</span> is used by{' '}
        {transactionCount} transaction{transactionCount !== 1 ? 's' : ''}.
        Reassign them before deleting.
      </p>
      <button
        onClick={onCancel}
        className="text-xs text-[#8b949e] hover:text-white transition-colors shrink-0"
      >
        Dismiss
      </button>
    </div>
  )
}

export default function CategoriesSection() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()

  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null)
  const [deleteBlocked, setDeleteBlocked] = useState<{
    category: Category
    transactionCount: number
  } | null>(null)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(getToken),
    staleTime: Infinity,
  })

  const userCategories = [
    ...(categoriesData?.expense ?? []),
    ...(categoriesData?.income ?? []),
  ].filter(c => c.userId)

  async function handleSave(
    data: CreateUserCategoryData | UpdateUserCategoryData,
  ) {
    try {
      if (editingCategory) {
        await updateUserCategory(editingCategory.id, data, getToken)
        setToast({ message: 'Category updated', type: 'success' })
      } else {
        await createUserCategory(data as CreateUserCategoryData, getToken)
        setToast({ message: 'Category created', type: 'success' })
      }
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      setShowModal(false)
      setEditingCategory(null)
    } catch {
      setToast({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      })
    }
  }

  async function handleDelete(category: Category) {
    try {
      const result = await deleteUserCategory(category.id, getToken)
      if ('transactionCount' in result) {
        setDeleteBlocked({
          category,
          transactionCount: result.transactionCount,
        })
        return
      }
      await queryClient.invalidateQueries({ queryKey: ['categories'] })
      setToast({ message: 'Category deleted', type: 'success' })
    } catch {
      setToast({
        message: 'Something went wrong. Please try again.',
        type: 'error',
      })
    }
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">My Categories</h2>
        <button
          onClick={() => {
            setEditingCategory(null)
            setShowModal(true)
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#00C896] border border-[#00C896]/30 hover:bg-[#00C896]/5 transition-colors"
        >
          <Plus size={13} />
          New Category
        </button>
      </div>

      <div className="bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-[#8b949e]">Loading...</p>
          </div>
        ) : userCategories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#1a2d3d] flex items-center justify-center">
              <Tag size={20} className="text-[#8b949e]" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">
                No custom categories yet
              </p>
              <p className="text-xs text-[#8b949e] mt-1">
                Create your first category to get started
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null)
                setShowModal(true)
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-[#00C896] border border-[#00C896]/30 hover:bg-[#00C896]/5 transition-colors"
            >
              <Plus size={14} />
              Create your first category
            </button>
          </div>
        ) : (
          <>
            {deleteBlocked && (
              <DeleteBlockedRow
                category={deleteBlocked.category}
                transactionCount={deleteBlocked.transactionCount}
                onCancel={() => setDeleteBlocked(null)}
              />
            )}
            {userCategories.map(cat => (
              <CategoryRow
                key={cat.id}
                category={cat}
                onEdit={c => {
                  setEditingCategory(c)
                  setShowModal(true)
                }}
                onDelete={c => setPendingDelete(c)}
              />
            ))}
          </>
        )}
      </div>

      {showModal && (
        <CategoryModal
          editCategory={editingCategory ?? undefined}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingCategory(null)
          }}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          name={pendingDelete.name}
          onConfirm={async () => {
            await handleDelete(pendingDelete)
            setPendingDelete(null)
          }}
          onClose={() => setPendingDelete(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </section>
  )
}
