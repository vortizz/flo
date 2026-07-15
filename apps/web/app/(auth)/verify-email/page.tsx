'use client'

import { useSignUp } from '@clerk/nextjs/legacy'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { FloLogo } from '@/components/logo'
import Link from 'next/link'

export default function VerifyEmailPage() {
  const { signUp, setActive, isLoaded } = useSignUp()
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const [isSuccess, setIsSuccess] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const email = signUp?.emailAddress || 'your email'
  const isComplete = code.every(d => d !== '')

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [resendCooldown])

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setError('')
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      inputRefs.current[5]?.focus()
    }
  }

  const handleVerify = async () => {
    if (!isLoaded || !signUp || !isComplete) return
    setIsLoading(true)
    setError('')
    try {
      const result = await signUp.attemptVerification({
        strategy: 'email_code',
        code: code.join(''),
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        setIsSuccess(true)
        setTimeout(() => router.push('/onboarding'), 1000)
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ long_message: string }> }
      setError(
        error.errors?.[0]?.long_message || 'Invalid code. Please try again.',
      )
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!isLoaded || !signUp || resendCooldown > 0) return
    try {
      await signUp.prepareVerification({ strategy: 'email_code' })
      setResendCooldown(30)
      setError('')
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> }
      setError(error.errors?.[0]?.message || 'Failed to resend code')
    }
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(circle at 40% 40%, #091c29 0%, #04090f 80%)',
      }}
    >
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-8 py-5 shrink-0">
        <div className="flex items-center gap-2">
          <FloLogo size={36} />
          <span className="text-white font-semibold text-xl">Flo</span>
        </div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#8b949e] hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 items-center justify-center px-4">
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{
              background: 'rgba(0, 200, 150, 0.1)',
              border: '1px solid rgba(0, 200, 150, 0.2)',
            }}
          >
            {isSuccess ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#00C896"
                  strokeWidth="2"
                />
                <path
                  d="M7 12l4 4 6-7"
                  stroke="#00C896"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect
                  x="2"
                  y="4"
                  width="20"
                  height="16"
                  rx="3"
                  stroke="#00C896"
                  strokeWidth="1.8"
                />
                <path
                  d="M2 8l10 7 10-7"
                  stroke="#00C896"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-2">
            {isSuccess ? 'Email verified!' : 'Check your email'}
          </h1>
          <p className="text-[#8b949e] text-sm text-center mb-8">
            {isSuccess ? (
              'Redirecting you to onboarding...'
            ) : (
              <>
                We sent a 6-digit code to
                <br />
                <span className="text-white font-semibold">{email}</span>
              </>
            )}
          </p>

          {!isSuccess && (
            <>
              {/* Code inputs */}
              <div className="flex gap-3 mb-6" onPaste={handlePaste}>
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => {
                      inputRefs.current[i] = el
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className={`w-12 h-14 text-center text-xl font-bold text-white rounded-xl border outline-none transition-all duration-200 ${
                      error
                        ? 'bg-red-500/10 border-red-500 focus:border-red-400'
                        : digit
                          ? 'bg-[#0d1f2d] border-[#00C896] focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20'
                          : 'bg-[#0d1f2d] border-[#1a2d3d] focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20'
                    }`}
                  />
                ))}
              </div>

              {/* Error */}
              {error && (
                <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
              )}

              {/* Verify button */}
              <button
                onClick={handleVerify}
                disabled={!isComplete || isLoading}
                className="w-full py-3 rounded-xl font-semibold text-sm text-black active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-5"
                style={{ background: '#00C896' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  'Verify email →'
                )}
              </button>

              {/* Resend */}
              <p className="text-sm text-[#8b949e] mb-2">
                Didn&apos;t receive a code?{' '}
                {resendCooldown > 0 ? (
                  <span className="text-[#4a6070]">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-[#00C896] hover:text-[#00b386] transition-colors font-medium"
                  >
                    Resend code
                  </button>
                )}
              </p>

              {/* Wrong email */}
              <p className="text-sm text-[#8b949e]">
                Wrong email?{' '}
                <Link
                  href="/sign-up"
                  className="text-white font-semibold hover:text-[#00C896] transition-colors"
                >
                  Go back
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-center gap-6 py-6 shrink-0">
        <Link
          href="/privacy"
          className="text-xs text-[#444] hover:text-[#888] transition-colors"
        >
          Privacy Policy
        </Link>
        <div className="w-1 h-1 rounded-full bg-[#444]" />
        <Link
          href="/terms"
          className="text-xs text-[#444] hover:text-[#888] transition-colors"
        >
          Terms of Service
        </Link>
        <div className="w-1 h-1 rounded-full bg-[#444]" />
        <Link
          href="/help"
          className="text-xs text-[#444] hover:text-[#888] transition-colors"
        >
          Help Center
        </Link>
      </div>
    </div>
  )
}
