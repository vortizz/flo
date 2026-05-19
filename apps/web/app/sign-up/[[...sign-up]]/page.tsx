'use client'

import { useSignUp, useSignIn } from '@clerk/nextjs/legacy'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, ArrowLeft, Globe } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GoogleIcon, AppleIcon } from '@/components/icons'
import { FloLogo } from '@/components/logo'

export default function SignUpPage() {
  const { isLoaded: isLoadedSignUp, signUp } = useSignUp()
  const { isLoaded: isLoadedSignIn, signIn } = useSignIn()
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(
    null,
  )

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const isEmailValid = email.length > 0 && validateEmail(email)
  const isEmailTouched = email.length > 0

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

  const isValidForm = isEmailValid && strength.score === 4 && agreedToTerms

  const handleGoogleSignUp = async () => {
    if (!isLoadedSignIn) return
    setOauthLoading('google')
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/dashboard',
      })
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> }
      setError(error.errors?.[0]?.message || 'Google sign up failed')
    } finally {
      setOauthLoading(null)
    }
  }

  const handleAppleSignUp = async () => {
    if (!isLoadedSignIn) return
    setOauthLoading('apple')
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_apple',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/dashboard',
      })
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> }
      setError(error.errors?.[0]?.message || 'Apple sign up failed')
    } finally {
      setOauthLoading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoadedSignUp || !isValidForm) return
    setIsLoading(true)
    setError('')
    try {
      await signUp.create({
        firstName: fullName.split(' ')[0],
        lastName: fullName.split(' ').slice(1).join(' '),
        emailAddress: email,
        password,
      })
      await signUp.prepareVerification({ strategy: 'email_code' })
      router.push('/verify-email')
    } catch (err: unknown) {
      console.error('Sign up error:', err)
      const error = err as { errors?: Array<{ message: string }> }
      setError(error.errors?.[0]?.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="h-dvh flex flex-col overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at 30% 50%, #0d2d42 0%, #071828 20%, #040e1a 50%, #020810 100%)',
      }}
    >
      {/* TOP BAR */}
      <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5 shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <FloLogo size={36} />
          <span className="text-white font-semibold text-xl">Flo</span>
        </div>

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-[#8b949e] hover:text-white text-sm transition-colors"
        >
          <ArrowLeft size={14} />
          Back
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden gap-0 lg:gap-24">
        {/* LEFT SIDE */}
        <div className="hidden lg:flex flex-col justify-center items-end w-1/2 pb-10">
          <div className="max-w-lg">
            <h1 className="text-5xl font-bold text-white mb-4">
              Take control of your{' '}
              <span className="text-[#00C896]">financial future.</span>
            </h1>
            <p className="text-[#8b949e] text-base leading-relaxed mb-10">
              Stop switching between banking apps. Flo gives you a complete
              picture of your money, automatically.
            </p>

            {/* Dashboard preview card */}
            <div
              className="rounded-2xl border border-[#1e2d3d] overflow-hidden"
              style={{ background: '#0d1f2d' }}
            >
              <div
                className="h-0.5 w-full"
                style={{
                  background:
                    'linear-gradient(90deg, #00C896 0%, #0099ff 100%)',
                }}
              />
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-[#8b949e] text-xs mb-1">
                      Total Balance (AUD)
                    </p>
                    <p className="text-white text-2xl font-bold">$42,850.00</p>
                  </div>
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(0, 200, 150, 0.1)' }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M12 2v10l7 4"
                        stroke="#00C896"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="#00C896"
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#00C896] animate-pulse" />
                  <p className="text-[#8b949e] text-xs">
                    Syncing with CommBank, ANZ...
                  </p>
                </div>

                <div className="h-px bg-[#1e2d3d] mb-4" />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(59, 130, 246, 0.15)' }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <rect
                            x="1"
                            y="3"
                            width="14"
                            height="10"
                            rx="2"
                            stroke="#60a5fa"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M1 7h14"
                            stroke="#60a5fa"
                            strokeWidth="1.2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          Salary Deposit
                        </p>
                        <p className="text-[#8b949e] text-xs">Today, 9:00 AM</p>
                      </div>
                    </div>
                    <span className="text-[#00C896] text-sm font-semibold">
                      +$4,200.00
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: 'rgba(239, 68, 68, 0.15)' }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <circle
                            cx="8"
                            cy="8"
                            r="6"
                            stroke="#f87171"
                            strokeWidth="1.2"
                          />
                          <path
                            d="M5.5 8h5M8 5.5v5"
                            stroke="#f87171"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">
                          Woolworths
                        </p>
                        <p className="text-[#8b949e] text-xs">Yesterday</p>
                      </div>
                    </div>
                    <span className="text-red-400 text-sm font-semibold">
                      -$142.50
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex w-full lg:w-1/2 overflow-y-auto justify-center lg:justify-start">
          <div className="flex flex-col justify-center py-6 px-4 sm:px-8 w-full max-w-lg mx-auto lg:mx-0">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Create your account
            </h2>
            <p className="text-[#8b949e] text-sm mb-6">
              Securely connect your Australian accounts.
            </p>

            {/* OAuth buttons */}
            <div className="space-y-3 mb-5">
              <button
                onClick={handleGoogleSignUp}
                disabled={!isLoadedSignIn || !!oauthLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#0d1f2d] hover:bg-[#112333] border border-[#1a2d3d] hover:border-[#2a3d4d] text-white text-sm font-medium py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'google' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <GoogleIcon size={18} color="white" />
                )}
                Continue with Google
              </button>

              <button
                onClick={handleAppleSignUp}
                disabled={!isLoadedSignIn || !!oauthLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#0d1f2d] hover:bg-[#112333] border border-[#1a2d3d] hover:border-[#2a3d4d] text-white text-sm font-medium py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'apple' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <AppleIcon size={18} color="white" />
                )}
                Continue with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#30363d]" />
              <span className="text-[#8b949e] text-xs font-medium tracking-widest uppercase">
                or continue with email
              </span>
              <div className="flex-1 h-px bg-[#30363d]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Full Name{' '}
                  <span className="text-[#8b949e] font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <svg
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8b949e]"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <circle
                      cx="7"
                      cy="5"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M1 13c0-3 2.686-5 6-5s6 2 6 5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full bg-[#0d1f2d] border border-[#1a2d3d] text-white placeholder-[#4a6070] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20 transition-all duration-200"
                  />
                </div>
              </div>

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
                    className={`w-full bg-[#0d1f2d] border text-white placeholder-[#4a6070] rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none transition-all duration-200 ${
                      isEmailTouched && !isEmailValid
                        ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20'
                        : isEmailValid
                          ? 'border-[#00C896] focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20'
                          : 'border-[#1a2d3d] focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20'
                    }`}
                  />
                  {/* Valid checkmark */}
                  {isEmailValid && (
                    <svg
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#00C896]"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M4 7l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  {/* Invalid X */}
                  {isEmailTouched && !isEmailValid && (
                    <svg
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-red-400"
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path
                        d="M5 5l4 4M9 5l-4 4"
                        stroke="currentColor"
                        strokeWidth="1.2"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </div>
                {/* Error message */}
                {isEmailTouched && !isEmailValid && (
                  <p className="text-red-400 text-xs mt-1">
                    Please enter a valid email address
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Password
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
                      x="2"
                      y="6"
                      width="10"
                      height="7"
                      rx="1.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M4.5 6V4a2.5 2.5 0 015 0v2"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full bg-[#0d1f2d] border border-[#1a2d3d] text-white placeholder-[#4a6070] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20 transition-all duration-200"
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
                    <div className="flex justify-between">
                      <span className={`text-xs ${strength.color}`}>
                        {strength.label}
                      </span>
                      <span className="text-xs text-[#8b949e]">
                        Must be at least 8 characters
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => setAgreedToTerms(!agreedToTerms)}
                  className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all duration-200 ${
                    agreedToTerms
                      ? 'bg-[#00C896] border-[#00C896]'
                      : 'bg-transparent border-[#484f58] hover:border-[#8b949e]'
                  }`}
                >
                  {agreedToTerms && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4l3 3 5-6"
                        stroke="black"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <p className="text-sm text-[#8b949e]">
                  I agree to Flo's{' '}
                  <Link
                    href="/terms"
                    className="text-white hover:text-[#00C896] transition-colors"
                  >
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link
                    href="/privacy"
                    className="text-white hover:text-[#00C896] transition-colors"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={!isLoadedSignUp || isLoading || !isValidForm}
                className="w-full py-3 rounded-xl font-semibold text-sm text-black active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
                style={{ background: '#00C896' }}
              >
                {isLoading ? 'Creating account...' : 'Create account →'}
              </button>
            </form>

            <p className="mt-4 text-sm text-[#8b949e] text-center">
              Already have an account?{' '}
              <Link
                href="/sign-in"
                className="text-white font-bold hover:text-[#00C896] transition-colors"
              >
                Log in
              </Link>
            </p>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[#8b949e] text-xs">
              <Globe size={12} />
              <span>
                Region: <strong className="text-white">Australia</strong> (AUD)
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
