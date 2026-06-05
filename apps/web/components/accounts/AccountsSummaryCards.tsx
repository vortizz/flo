import { Building2, RefreshCw, Wallet } from 'lucide-react'

interface AccountsSummaryCardsProps {
  totalBalance: number
  totalAccounts: number
  lastSyncedAt: string | null
}

function formatAUD(amount: number) {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
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

export default function AccountsSummaryCards({
  totalBalance,
  totalAccounts,
  lastSyncedAt,
}: AccountsSummaryCardsProps) {
  const cards = [
    {
      label: 'Total Balance',
      value: formatAUD(totalBalance),
      addCurrency: true,
      footer: 'Across all accounts',
      color: '#00C896',
      icon: <Wallet size={16} />,
    },
    {
      label: 'Connected Accounts',
      value: String(totalAccounts),
      footer: 'Via Open Banking',
      addCurrency: false,
      color: '#3b82f6',
      icon: <Building2 size={16} />,
    },
    {
      label: 'Last Synced',
      value: formatLastSync(lastSyncedAt),
      footer: 'Auto syncs every 15min',
      addCurrency: false,
      color: '#a855f7',
      icon: <RefreshCw size={16} />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map(card => (
        <div
          key={card.label}
          className="relative overflow-hidden bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl p-5 flex flex-col gap-2
            before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:rounded-t
            after:content-[''] after:absolute after:inset-0 after:rounded-xl after:pointer-events-none"
          style={{
            ['--card-color' as string]: card.color,
          }}
        >
          <div
            className="absolute top-0 left-0 right-0 h-0.5 rounded-t"
            style={{
              background: `linear-gradient(90deg, ${card.color}, ${card.color}1a)`,
            }}
          />
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background: `radial-gradient(circle at top left, ${card.color}12 0%, transparent 60%)`,
            }}
          />

          <div className="flex items-center justify-between relative">
            <span className="text-xs text-[#8b949e] font-medium">
              {card.label}
            </span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border"
              style={{
                background: `${card.color}1a`,
                color: card.color,
                borderColor: `${card.color}3a`,
              }}
            >
              {card.icon}
            </div>
          </div>

          <span className="text-2xl sm:text-3xl font-bold tracking-tight text-white relative">
            {card.value}
            {card.addCurrency && (
              <span className="text-sm text-[#8b949e] font-normal ml-1.5">
                AUD
              </span>
            )}
          </span>

          <span className="text-xs text-[#8b949e] relative">{card.footer}</span>
        </div>
      ))}
    </div>
  )
}
