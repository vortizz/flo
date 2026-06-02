'use client'

import { useState } from 'react'
import {
  Eye,
  ClipboardList,
  Wallet,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import Image from 'next/image'
import type { Institution } from '@/types/institution'

interface StepConsentProps {
  banks: Institution[]
  selectedBanks: string[]
  onContinue: () => void
  onBack: () => void
}

const PERMISSIONS = [
  {
    icon: Eye,
    title: 'View only',
    description:
      'Flo can only read your data. We can never move money, make payments, or change anything on your account.',
  },
  {
    icon: ClipboardList,
    title: 'Transaction history',
    description:
      'Up to 12 months of past transactions to analyse your spending patterns.',
  },
  {
    icon: Wallet,
    title: 'Account balances',
    description:
      'Your current balance across selected accounts to track your net worth.',
  },
]

const NEVER_DO = [
  'Move or transfer money',
  'Store your bank login credentials',
  'Share your data with third parties',
  'Access your full account number or BSB',
]

export function StepConsent({
  banks,
  selectedBanks,
  onContinue,
  onBack,
}: StepConsentProps) {
  const [isAgreeing, setIsAgreeing] = useState(false)

  const selectedInstitutions = selectedBanks
    .map(id => banks.find(b => b.id === id))
    .filter(Boolean) as Institution[]

  const handleAgree = () => {
    setIsAgreeing(true)
    setTimeout(() => {
      setIsAgreeing(false)
      onContinue()
    }, 500)
  }

  return (
    <div className="w-full lg:w-1/2 max-w-140 bg-[#0a1622]/60 border border-[#1e2d3d] rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white mb-1">
        Here&apos;s what Flo will access
      </h2>
      <p className="text-[#8b949e] text-xs mb-5">
        Review the permissions below before connecting your bank.
      </p>

      {/* Selected banks row */}
      <div className="flex flex-wrap gap-3 mb-6">
        {selectedInstitutions.map(bank => (
          <div
            key={bank.id}
            className="flex items-center gap-2 bg-[#0d1f2d] border border-[#1e2d3d] rounded-full px-3 py-1.5"
          >
            {bank.logoUrl ? (
              <Image
                src={bank.logoUrl}
                alt={bank.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-[#1e2d3d] flex items-center justify-center">
                <span className="text-[#8b949e] text-[9px] font-bold">
                  {(bank.shortName ?? bank.name).slice(0, 3).toUpperCase()}
                </span>
              </div>
            )}
            <span className="text-white text-xs font-medium">
              {bank.shortName ?? bank.name}
            </span>
          </div>
        ))}
      </div>

      {/* Permission cards */}
      <div className="space-y-3 mb-4">
        {PERMISSIONS.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="flex items-start gap-4 p-4 rounded-xl border border-[#1e2d3d] bg-[#0d1f2d]"
          >
            <div className="w-9 h-9 rounded-lg bg-[#00C896]/10 flex items-center justify-center shrink-0">
              <Icon size={16} className="text-[#00C896]" />
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-0.5">{title}</p>
              <p className="text-[#8b949e] text-xs leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* What Flo will never do */}
      <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 mb-4">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-wider mb-3">
          What Flo will never do
        </p>
        <div className="space-y-2">
          {NEVER_DO.map(item => (
            <div key={item} className="flex items-center gap-2.5">
              <X size={13} className="text-red-400 shrink-0" />
              <span className="text-[#8b949e] text-xs">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Duration */}
      <p className="text-[#4a6070] text-xs mb-4 leading-relaxed">
        <span className="text-[#8b949e] font-medium">Duration:</span> Access is
        ongoing until you disconnect. You can revoke at any time from{' '}
        <span className="text-white">Settings → Connected Banks</span>.
      </p>

      {/* Basiq trust badge */}
      <div className="flex items-start gap-3 p-3 rounded-xl border border-[#1e2d3d] bg-[#0d1f2d] mb-6">
        <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0">
          <span className="text-black text-[10px] font-black">bsq</span>
        </div>
        <p className="text-[#8b949e] text-xs leading-relaxed">
          Your connection is secured by{' '}
          <span className="text-white font-medium">Basiq</span>, an
          ASIC-licensed Open Banking provider regulated under Australia&apos;s{' '}
          <span className="text-white">
            Consumer Data Right (CDR) framework
          </span>
          .{' '}
          <a
            href="https://docs.basiq.io/en/articles/5088017-consumer-data-right-cdr-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00C896] inline-flex items-center gap-0.5 hover:underline"
          >
            Learn more <ExternalLink size={10} />
          </a>
        </p>
      </div>

      {/* Buttons */}
      <button
        onClick={handleAgree}
        disabled={isAgreeing}
        className="w-full bg-[#00C896] hover:bg-[#00b084] disabled:opacity-40 text-black font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm mb-3"
      >
        {isAgreeing && <Loader2 className="animate-spin" size={18} />}
        {isAgreeing ? 'Processing...' : 'I Agree & Continue'}
      </button>
      <button
        onClick={onBack}
        className="w-full border border-[#1e2d3d] hover:border-[#4a6070] text-[#8b949e] hover:text-white font-medium py-3.5 px-4 rounded-xl transition-colors text-sm"
      >
        Go Back
      </button>
    </div>
  )
}
