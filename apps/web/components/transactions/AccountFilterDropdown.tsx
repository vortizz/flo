'use client'

import { useState, useRef, useEffect } from 'react'
import { Building2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import Image from 'next/image'
import CashAvatar from '../ui/CashAvatar'

interface Account {
  id: string
  accountName: string
  bankName: string
  last4: string | null
  logoUrl: string | null
  isCash: boolean
}

interface AccountFilterDropdownProps {
  accounts: Account[]
  value: string
  onChange: (value: string) => void
}

function BankInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  const colors: Record<string, string> = {
    CBA: '#f5a623',
    ANZ: '#007DBA',
    NAB: '#CC0000',
    WBC: '#D5002B',
    AMEX: '#006FCF',
  }

  const key = Object.keys(colors).find(k => name.toUpperCase().includes(k))
  const bg = key ? colors[key] : '#1a2d3d'

  return (
    <div
      className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white shrink-0"
      style={{ background: bg }}
    >
      {initials}
    </div>
  )
}

export default function AccountFilterDropdown({
  accounts,
  value,
  onChange,
}: AccountFilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selected = accounts.find(a => a.id === value)
  const label = selected ? selected.accountName : 'All Accounts'

  // Group by bank
  const grouped = accounts.reduce<Record<string, Account[]>>((acc, account) => {
    const bank = account.bankName
    if (!acc[bank]) acc[bank] = []
    acc[bank].push(account)
    return acc
  }, {})

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className={[
          'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap',
          open || value
            ? 'border-[#00C896]/60 bg-[#00C896]/5'
            : 'border-white/10 text-white bg-[#0f172a] hover:border-[#00C896]/30 hover:text-[#e6edf3]',
        ].join(' ')}
      >
        <Building2
          size={14}
          className={open || value ? 'text-[#00C896]' : 'text-[#94a3b8]'}
        />
        {label}
        {open ? (
          <ChevronUp size={14} className="text-[#00C896]" />
        ) : (
          <ChevronDown size={14} />
        )}
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-2 z-50 p-1.5 bg-[#0d1f2d] border border-[#1a2d3d] rounded-xl shadow-xl min-w-56 overflow-hidden">
          {/* All Accounts option */}
          <button
            onClick={() => {
              onChange('')
              setOpen(false)
            }}
            className={[
              'w-full flex items-center justify-between gap-3 px-4 py-3 text-xs transition-colors',
              !value
                ? 'text-[#00C896] bg-[#00c8960f]'
                : 'text-[#8b949e] hover:text-white hover:bg-[#ffffff08]',
            ].join(' ')}
          >
            <span className="flex items-center gap-2.5">
              <Building2 size={12} />
              All Accounts
            </span>
            {!value && <Check size={12} className="text-[#00C896]" />}
          </button>

          <hr className="border-[#1a2d3d] my-1" />

          {/* Grouped accounts */}
          {Object.entries(grouped).map(([bank, bankAccounts]) => (
            <div key={bank}>
              <div className="px-4 py-2 pb-1 text-[10px] font-semibold text-[#8b949e] uppercase tracking-[0.08em]">
                {bank}
              </div>
              {bankAccounts.map(account => (
                <button
                  key={account.id}
                  onClick={() => {
                    onChange(account.id)
                    setOpen(false)
                  }}
                  className={[
                    'w-full flex items-center justify-between gap-2.5 px-4 py-2.5 transition-colors',
                    account.id === value
                      ? 'bg-[#00C896]/5'
                      : 'hover:bg-[#ffffff08]',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-3">
                    {account.logoUrl ? (
                      <Image
                        src={account.logoUrl}
                        alt={bank}
                        width={20}
                        height={20}
                        className="rounded-full"
                      />
                    ) : account.isCash ? (
                      <CashAvatar size="xs" />
                    ) : (
                      <BankInitials name={bank} />
                    )}
                    <span className="flex flex-col items-start">
                      <span
                        className={[
                          'text-xs font-medium',
                          account.id === value
                            ? 'text-[#00C896]'
                            : 'text-[#cbd5e1]',
                        ].join(' ')}
                      >
                        {account.accountName}
                      </span>
                      {account.last4 && (
                        <span className="text-[11px] text-[#8b949e]">
                          ••• {account.last4}
                        </span>
                      )}
                    </span>
                  </span>
                  {account.id === value && (
                    <Check size={12} className="text-[#00C896]" />
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
