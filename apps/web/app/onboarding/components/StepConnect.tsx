'use client'

import { useEffect, useRef, useState } from 'react'
import { Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import type { Institution } from '@/types/institution'

interface StepConnectProps {
  banks: Institution[]
  selectedBanks: string[]
  initialBankIndex: number
  source?: string
  onBack: () => void
}

export function StepConnect({
  banks,
  selectedBanks,
  initialBankIndex,
  source,
  onBack,
}: StepConnectProps) {
  const { getToken } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [currentBankIndex] = useState(initialBankIndex)
  const hasRedirected = useRef(false)

  useEffect(() => {
    async function redirect() {
      if (hasRedirected.current) return
      hasRedirected.current = true

      try {
        const token = await getToken()

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/basiq/auth-link`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              institutionId: selectedBanks[currentBankIndex],
              bankIndex: currentBankIndex,
              total: selectedBanks.length,
              ...(source ? { source } : {}),
            }),
          },
        )

        if (!response.ok) throw new Error(`Status: ${response.status}`)
        const { url } = await response.json()
        window.location.href = url
      } catch (err) {
        console.error('Failed to get auth link:', err)
        setError('Something went wrong. Please try again.')
      } finally {
        hasRedirected.current = false
      }
    }

    redirect()
  }, [currentBankIndex, getToken, selectedBanks, source])

  const currentBank = banks.find(b => b.id === selectedBanks[currentBankIndex])

  if (error) {
    return (
      <div className="w-full lg:w-1/2 max-w-140 bg-[#0a1622]/60 border border-[#1e2d3d] rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center gap-4 min-h-64">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-white font-medium text-sm">{error}</p>
        <button
          onClick={() => {
            sessionStorage.removeItem('basiqJobIds')
            onBack()
          }}
          className="border border-[#1e2d3d] hover:border-[#4a6070] text-[#8b949e] hover:text-white font-medium py-2.5 px-6 rounded-xl transition-colors text-sm"
        >
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div className="w-full lg:w-1/2 max-w-140 bg-[#0a1622]/60 border border-[#1e2d3d] rounded-2xl p-6 shadow-xl backdrop-blur-sm flex flex-col items-center justify-center gap-4 min-h-64">
      <Loader2 className="animate-spin text-[#00C896]" size={36} />
      <p className="text-white font-medium text-sm">
        Connecting {currentBank?.shortName ?? currentBank?.name ?? 'your bank'}
        ...
      </p>
      {selectedBanks.length > 1 && (
        <p className="text-[#4a6070] text-xs">
          Bank {currentBankIndex + 1} of {selectedBanks.length}
        </p>
      )}
      <p className="text-[#4a6070] text-xs text-center max-w-xs">
        You will be redirected to securely connect your bank. This is handled by
        Basiq, an ASIC-licensed Open Banking provider.
      </p>
    </div>
  )
}
