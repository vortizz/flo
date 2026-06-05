'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { RefreshCw, CircleCheck, TriangleAlert } from 'lucide-react'
import { type Account, deleteAccount } from '@/lib/api/accounts'
import AccountActionsMenu from './AccountActionsMenu'
import DisconnectModal from './DisconnectModal'
import { Toast } from '@/components/ui/Toast'
import Image from 'next/image'

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatLastSync(dateStr: string | null) {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  const diff = Math.floor((Date.now() - date.getTime()) / (1000 * 60))
  if (diff < 60) return `${diff}m ago`
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`
  return `${Math.floor(diff / 1440)}d ago`
}

function BankAvatar({
  name,
  logoUrl,
}: {
  name: string
  logoUrl: string | null
}) {
  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={name}
        width={36}
        height={36}
        className="rounded-full"
      />
    )
  }
  const colors: Record<string, string> = {
    CBA: '#f5a623',
    ANZ: '#007DBA',
    NAB: '#CC0000',
    WBC: '#D5002B',
    AMEX: '#006FCF',
  }
  const key = Object.keys(colors).find(k => name.toUpperCase().includes(k))
  const bg = key ? colors[key] : '#1a2d3d'
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
      style={{ background: bg }}
    >
      {initials}
    </div>
  )
}

function StatusBadge({ status }: { status: Account['status'] }) {
  const config = {
    connected: {
      icon: <CircleCheck width={10} height={10} />,
      label: 'Connected',
      class: 'text-[#2dd4bf] bg-[#14b8a61a] border-[#14b8a633]',
    },
    disconnected: {
      icon: <TriangleAlert width={10} height={10} />,
      label: 'Disconnected',
      class: 'text-red-400 bg-red-500/10 border-red-500/20',
    },
    syncing: {
      icon: <RefreshCw width={10} height={10} />,
      label: 'Syncing',
      class: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
  }
  const { icon, label, class: cls } = config[status]
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs w-fit border ${cls}`}
    >
      {icon}
      {label}
    </span>
  )
}

export default function AccountRow({ account }: { account: Account }) {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: 'success' | 'error'
  } | null>(null)

  async function handleDisconnect() {
    setIsDeleting(true)
    try {
      await deleteAccount(account.id, getToken)
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      setShowModal(false)
      setToast({
        message: `${account.accountName} disconnected successfully`,
        type: 'success',
      })
    } catch (e) {
      console.error(e)
      setToast({
        message: 'Failed to disconnect account. Please try again.',
        type: 'error',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr_1.5fr_80px] gap-4 px-6 py-4 border-b border-[#1a2d3d] hover:bg-[#ffffff04] transition-colors items-center">
        {/* Bank */}
        <div className="flex items-center gap-3 min-w-0">
          <BankAvatar name={account.bankName} logoUrl={account.logoUrl} />
          <span className="text-sm text-white font-medium truncate">
            {account.bankName}
          </span>
        </div>

        {/* Account Name */}
        <div className="flex flex-col min-w-0">
          <span className="text-sm text-white truncate">
            {account.accountName}
          </span>
          {account.last4 && (
            <span className="text-xs text-[#8b949e]">••• {account.last4}</span>
          )}
        </div>

        {/* Currency */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium text-white bg-blue-800 px-1 py-0.5 rounded-full">
            AU
          </span>
          <span className="text-sm text-[#8b949e]">AUD</span>
        </div>

        {/* Balance */}
        <span
          className={`text-sm ${account.balance < 0 ? 'text-red-400' : 'text-[#8b949e]'}`}
        >
          {formatAUD(account.balance)}
        </span>

        {/* Last Sync */}
        <span className="text-sm text-[#8b949e]">
          {formatLastSync(account.lastSyncedAt)}
        </span>

        {/* Status */}
        <StatusBadge status={account.status} />

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 flex items-center justify-center rounded-md text-[#8b949e] hover:text-white hover:bg-[#1a2d3d] transition-colors">
            <RefreshCw size={14} />
          </button>
          <AccountActionsMenu onDisconnect={() => setShowModal(true)} />
        </div>
      </div>

      {showModal && (
        <DisconnectModal
          accountName={account.accountName}
          bankName={account.bankName}
          onConfirm={handleDisconnect}
          onCancel={() => setShowModal(false)}
          isLoading={isDeleting}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
