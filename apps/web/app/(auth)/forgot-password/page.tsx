'use client'

import { useSignIn } from '@clerk/nextjs/legacy'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { FloLogo } from '@/components/logo'

export default function ForgotPasswordPage() {
  const { signIn, isLoaded } = useSignIn()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    setIsLoading(true)
    setError('')
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      })
      setIsSuccess(true)
      router.push(`/reset-password?email=${encodeURIComponent(email)}`)
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> }
      setError(error.errors?.[0]?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
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
      <div className="flex flex-1 items-center justify-center px-4">
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

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-1">
            Forgot password?
          </h1>
          <p className="text-[#8b949e] text-sm text-center mb-6">
            No worries. Enter your email and we'll send you a reset code.
          </p>

          {/* Card */}
          <div
            className="w-full rounded-2xl p-6 border border-[#1a2d3d]"
            style={{ background: '#0d1f2d' }}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b949e]"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <rect
                      x="1"
                      y="3"
                      width="12"
                      height="9"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M1 5l6 4 6-4"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                  <input
                    type="email"
                    placeholder="you@example.com.au"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full bg-[#111c2a] border border-[#1e2d3d] text-white placeholder-[#4a6070] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20 transition-all duration-200"
                  />
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 rounded-xl font-semibold text-sm text-black active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ background: '#00C896' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  'Send reset code'
                )}
              </button>
            </form>
          </div>

          <p className="mt-5 text-sm text-[#8b949e]">
            Remember your password?{' '}
            <Link
              href="/sign-in"
              className="text-white font-bold hover:text-[#00C896] transition-colors"
            >
              Sign in
            </Link>
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
