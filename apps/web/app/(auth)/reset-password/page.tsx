'use client'

import { useSignIn } from '@clerk/nextjs/legacy'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { FloLogo } from '@/components/logo'

export default function ResetPasswordPage() {
  const { signIn, isLoaded, setActive } = useSignIn()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || 'your email'
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const isComplete =
    code.every(d => d !== '') &&
    password.length >= 8 &&
    password === confirmPassword

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

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { score: 0, label: '', color: '' }
    if (pass.length < 6)
      return { score: 1, label: 'Weak', color: 'text-red-400' }
    if (pass.length < 8)
      return { score: 2, label: 'Fair', color: 'text-yellow-400' }
    if (pass.length < 10)
      return { score: 3, label: 'Good', color: 'text-blue-400' }
    return { score: 4, label: 'Strong', color: 'text-[#00C896]' }
  }

  const strength = getPasswordStrength(password)

  const handleSubmit = async () => {
    if (!isLoaded || !signIn || !isComplete) return
    setIsLoading(true)
    setError('')
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.join(''),
        password,
      })
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
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
    if (!isLoaded || !signIn || resendCooldown > 0) return
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
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
          'radial-gradient(ellipse at 50% 40%, #0a2538 0%, #061320 20%, #040c18 50%, #020810 100%)',
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
      <div className="flex flex-1 items-center justify-center px-4 overflow-y-auto py-6">
        <div className="flex flex-col items-center w-full max-w-md">
          {/* Icon */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            style={{
              background: 'rgba(0, 200, 150, 0.1)',
              border: '1px solid rgba(0, 200, 150, 0.2)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect
                x="3"
                y="11"
                width="18"
                height="11"
                rx="2"
                stroke="#00C896"
                strokeWidth="1.8"
              />
              <path
                d="M7 11V7a5 5 0 0110 0v4"
                stroke="#00C896"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-white mb-1">Reset password</h1>
          <p className="text-[#8b949e] text-sm text-center mb-6">
            Enter the code sent to{' '}
            <span className="text-white font-semibold">{email}</span> and your
            new password.
          </p>

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
                    ? 'bg-red-500/10 border-red-500'
                    : digit
                      ? 'bg-[#0d1f2d] border-[#00C896]'
                      : 'bg-[#0d1f2d] border-[#1a2d3d] focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20'
                }`}
              />
            ))}
          </div>

          {/* Password fields */}
          <div
            className="w-full rounded-2xl p-6 border border-[#1a2d3d] space-y-4 mb-4"
            style={{ background: '#0d1f2d' }}
          >
            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-[#111c2a] border border-[#1e2d3d] text-white placeholder-[#4a6070] rounded-xl px-4 py-2.5 pr-12 text-sm outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                          i <= strength.score
                            ? strength.score === 1
                              ? 'bg-red-400'
                              : strength.score === 2
                                ? 'bg-yellow-400'
                                : strength.score === 3
                                  ? 'bg-blue-400'
                                  : 'bg-[#00C896]'
                            : 'bg-[#30363d]'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs ${strength.color}`}>
                    {strength.label}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full bg-[#111c2a] border text-white placeholder-[#4a6070] rounded-xl px-4 py-2.5 pr-12 text-sm outline-none transition-all duration-200 ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-500 focus:border-red-500'
                      : confirmPassword && confirmPassword === password
                        ? 'border-[#00C896] focus:border-[#00C896]'
                        : 'border-[#1e2d3d] focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-white transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={14} />
                  ) : (
                    <Eye size={14} />
                  )}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <p className="text-red-400 text-xs mt-1">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">{error}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!isComplete || isLoading}
            className="w-full py-3 rounded-xl font-semibold text-sm text-black active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center mb-4"
            style={{ background: '#00C896' }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              'Reset password'
            )}
          </button>

          <p className="text-sm text-[#8b949e]">
            Didn't receive a code?{' '}
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
