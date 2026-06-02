'use client'

import { useRef, useState } from 'react'
import { Search, Landmark, CheckCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'

interface Institution {
  id: string
  name: string
  shortName: string | null
  institutionType: string
  logoUrl: string | null
  isPopular: boolean
}

interface StepSelectProps {
  banks: Institution[]
  isLoading: boolean
  selectedBanks: string[]
  onToggleBank: (id: string) => void
  onContinue: () => void
}

export function StepSelect({
  banks,
  isLoading,
  selectedBanks,
  onToggleBank,
  onContinue,
}: StepSelectProps) {
  const searchRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)

  const filteredBanks = banks.filter(
    b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.shortName ?? '').toLowerCase().includes(search.toLowerCase()),
  )

  const displayBanks = search
    ? filteredBanks.slice(0, 10)
    : banks.filter(b => b.isPopular)

  const handleContinue = () => {
    if (selectedBanks.length === 0) return
    setIsConnecting(true)
    setTimeout(() => {
      setIsConnecting(false)
      onContinue()
    }, 500)
  }

  return (
    <>
      {/* RIGHT CARD */}
      <div className="w-full lg:w-1/2 max-w-140 bg-[#0a1622]/60 border border-[#1e2d3d] rounded-2xl p-6 shadow-xl backdrop-blur-sm">
        <h2 className="text-xl font-bold text-white mb-1">Select your banks</h2>
        <p className="text-[#8b949e] text-xs mb-6">
          Choose one or more institutions to get started.
        </p>

        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6070]"
            size={18}
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search for your bank..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#07111c] border border-[#1e2d3d] rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#4a6070] focus:outline-none focus:border-[#00C896] transition-colors text-sm"
          />
        </div>

        {search && filteredBanks.length > 10 && (
          <p className="text-[#4a6070] text-xs mb-3">
            Showing 10 of {filteredBanks.length} results — type more to narrow
            down
          </p>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="animate-spin text-[#00C896]" size={32} />
            <span className="text-[#4a6070] text-xs font-medium">
              Loading banks...
            </span>
          </div>
        ) : (
          <>
            {!search && (
              <p className="text-[#4a6070] text-xs mb-3">Popular banks</p>
            )}
            <div className="grid grid-cols-2 gap-3">
              {displayBanks.map(bank => (
                <button
                  key={bank.id}
                  onClick={() => onToggleBank(bank.id)}
                  className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                    selectedBanks.includes(bank.id)
                      ? 'border-[#00C896] bg-[#00C896]/5 shadow-[0_0_15px_rgba(0,200,150,0.1)]'
                      : 'border-[#1e2d3d] bg-[#07111c]/40 hover:border-[#4a6070]'
                  }`}
                >
                  {selectedBanks.includes(bank.id) && (
                    <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#00C896] flex items-center justify-center">
                      <CheckCircle size={12} className="text-black" />
                    </div>
                  )}
                  <div className="w-12 h-12 mb-2 flex items-center justify-center">
                    {bank.logoUrl ? (
                      <Image
                        src={bank.logoUrl}
                        alt={bank.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-[#1e2d3d] flex items-center justify-center border border-[#2e3d4d]">
                        <span className="text-[#8b949e] text-xs font-bold">
                          {(bank.shortName ?? bank.name)
                            .slice(0, 3)
                            .toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-white font-medium text-xs text-center truncate w-full px-1">
                    {bank.shortName ?? bank.name}
                  </span>
                </button>
              ))}

              {!search && (
                <button
                  onClick={() => searchRef.current?.focus()}
                  className="relative flex flex-col items-center justify-center p-4 rounded-2xl border border-[#1e2d3d] bg-[#07111c]/40 hover:border-[#4a6070] transition-all"
                >
                  <div className="w-12 h-12 mb-2 rounded-full bg-[#1e2d3d] flex items-center justify-center border border-[#2e3d4d]">
                    <Landmark size={20} className="text-[#4a6070]" />
                  </div>
                  <span className="text-white font-medium text-xs text-center">
                    Other bank
                  </span>
                </button>
              )}

              {search && displayBanks.length === 0 && (
                <div className="col-span-2 text-center py-12 text-[#4a6070] text-sm">
                  No banks match your search.
                </div>
              )}
            </div>
          </>
        )}

        {selectedBanks.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {selectedBanks.map(id => {
              const bank = banks.find(b => b.id === id)
              if (!bank) return null
              return (
                <span
                  key={id}
                  className="flex items-center gap-1.5 bg-[#0d1f2d] border border-[#1e2d3d] text-white text-xs px-3 py-1.5 rounded-full"
                >
                  {bank.shortName ?? bank.name}
                  <button
                    onClick={() => onToggleBank(id)}
                    className="text-[#4a6070] hover:text-white transition-colors"
                  >
                    ×
                  </button>
                </span>
              )
            })}
          </div>
        )}

        <button
          onClick={handleContinue}
          disabled={selectedBanks.length === 0 || isConnecting}
          className="w-full mt-6 bg-[#00C896] hover:bg-[#00b084] disabled:opacity-40 text-black font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm"
        >
          {isConnecting && <Loader2 className="animate-spin" size={18} />}
          {isConnecting
            ? 'Connecting Securely...'
            : selectedBanks.length > 1
              ? `Continue with ${selectedBanks.length} banks`
              : 'Continue'}
        </button>
        <p className="text-center text-xs text-[#4a6070] mt-4">
          By connecting, you agree to our{' '}
          <span className="cursor-pointer text-[#00c896]">Terms</span> and{' '}
          <span className="cursor-pointer text-[#00c896]">Privacy Policy</span>.
        </p>
      </div>
    </>
  )
}
