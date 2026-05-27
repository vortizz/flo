'use client'

import { useState } from 'react'
import { Loader2, Phone } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'

interface StepMobileProps {
  onContinue: () => void
  onBack: () => void
}

const formatMobile = (value: string) => {
  const digits = value.replace(/\D/g, '')
  if (digits.startsWith('61')) {
    return '+' + digits
  }
  if (digits.length <= 4) return digits
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`
}

const validateMobile = (mobile: string) => {
  const regex = /^(\+?61|0)4\d{8}$/
  return regex.test(mobile.replace(/\s/g, ''))
}

const normaliseMobile = (mobile: string) => {
  const digits = mobile.replace(/\s/g, '')
  if (digits.startsWith('0')) return digits.replace(/^0/, '+61')
  return digits
}

export function StepMobile({ onContinue, onBack }: StepMobileProps) {
  const { getToken } = useAuth()
  const [mobile, setMobile] = useState('')
  const [isTouched, setIsTouched] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isValid = validateMobile(mobile)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMobile(formatMobile(e.target.value))
    setError(null)
  }

  const handleContinue = async () => {
    if (!isValid) return
    setIsLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/mobile`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ mobile: normaliseMobile(mobile) }),
        },
      )

      if (!response.ok) throw new Error(`Status: ${response.status}`)
      onContinue()
    } catch (err) {
      console.error('Failed to save mobile:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full lg:w-1/2 max-w-140 bg-[#0a1622]/60 border border-[#1e2d3d] rounded-2xl p-6 shadow-xl backdrop-blur-sm">
      <h2 className="text-xl font-bold text-white mb-1">
        Enter your mobile number
      </h2>
      <p className="text-[#8b949e] text-xs mb-6">
        We need your mobile number to securely verify your identity when
        connecting your bank. This is required by Basiq&apos;s Open Banking
        flow.
      </p>

      <div className="relative mb-2">
        <Phone
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6070]"
          size={16}
        />
        <input
          type="tel"
          placeholder="0412 345 678"
          value={mobile}
          onChange={handleChange}
          onBlur={() => setIsTouched(true)}
          className={`w-full bg-[#07111c] border rounded-xl pl-10 pr-4 py-3 text-white placeholder-[#4a6070] focus:outline-none transition-colors text-sm ${
            isTouched && !isValid
              ? 'border-red-500 focus:border-red-500'
              : isValid
                ? 'border-[#00C896] focus:border-[#00C896]'
                : 'border-[#1e2d3d] focus:border-[#00C896]'
          }`}
        />
      </div>

      {isTouched && !isValid && (
        <p className="text-red-400 text-xs mb-4">
          Please enter a valid Australian mobile number (e.g. 0412 345 678)
        </p>
      )}

      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      <p className="text-[#4a6070] text-xs mb-6">
        Your number is only used to verify your identity during bank connection.
        It will never be shared or used for marketing.
      </p>

      <button
        onClick={handleContinue}
        disabled={!isValid || isLoading}
        className="w-full bg-[#00C896] hover:bg-[#00b084] disabled:opacity-40 text-black font-semibold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm mb-3"
      >
        {isLoading && <Loader2 className="animate-spin" size={18} />}
        {isLoading ? 'Saving...' : 'Continue'}
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
