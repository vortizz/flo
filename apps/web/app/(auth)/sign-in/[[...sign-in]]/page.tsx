'use client'

import { useSignIn, useSignUp } from '@clerk/nextjs/legacy'
import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, Fingerprint } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { GoogleIcon, AppleIcon } from '@/components/icons'
import { FloLogo } from '@/components/logo'

export default function SignInPage() {
  const { signIn, isLoaded, setActive } = useSignIn()
  const { isLoaded: isLoadedSignUp, signUp } = useSignUp()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(
    null,
  )

  const handleGoogleSignIn = async () => {
    if (!isLoadedSignUp) return
    setOauthLoading('google')
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/onboarding',
      })
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> }
      setError(error.errors?.[0]?.message || 'Google sign in failed')
      setOauthLoading(null)
    }
  }

  const handleAppleSignIn = async () => {
    if (!isLoadedSignUp) return
    setOauthLoading('apple')
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_apple',
        redirectUrl: `${window.location.origin}/sso-callback`,
        redirectUrlComplete: '/onboarding',
      })
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ message: string }> }
      setError(error.errors?.[0]?.message || 'Apple sign in failed')
      setOauthLoading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoaded || !signIn) return
    setIsLoading(true)
    setError('')
    try {
      const result = await signIn.create({
        identifier: email,
        password,
      })
      if (result.status === 'complete') {
        console.log('Sign in successful, redirecting to dashboard...')
        await setActive({ session: result.createdSessionId })
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      const error = err as { errors?: Array<{ code: string; message: string }> }
      const code = error.errors?.[0]?.code
      if (code === 'strategy_for_user_invalid') {
        setError(
          'This account was created using a social login. Please use the same method you signed up with.',
        )
      } else {
        setError(error.errors?.[0]?.message || 'Invalid email or password')
      }
    } finally {
      setIsLoading(false)
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
            <Fingerprint size={24} color="#00C896" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-[#8b949e] text-sm mb-6">
            Please enter your details to sign in.
          </p>

          {/* Card */}
          <div
            className="w-full rounded-2xl p-6 border border-[#1a2d3d]"
            style={{ background: '#0d1f2d' }}
          >
            {/* OAuth buttons */}
            <div className="space-y-3 mb-5">
              <button
                onClick={handleGoogleSignIn}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#111c2a] hover:bg-[#152234] border border-[#1e2d3d] hover:border-[#2a3d4d] text-white text-sm font-medium py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'google' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <GoogleIcon size={18} color="white" />
                )}
                Sign in with Google
              </button>

              <button
                onClick={handleAppleSignIn}
                disabled={!!oauthLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#111c2a] hover:bg-[#152234] border border-[#1e2d3d] hover:border-[#2a3d4d] text-white text-sm font-medium py-3 rounded-xl transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {oauthLoading === 'apple' ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <AppleIcon size={18} color="white" />
                )}
                Sign in with Apple
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-[#1e2d3d]" />
              <span className="text-[#8b949e] text-xs font-medium uppercase tracking-widest">
                or
              </span>
              <div className="flex-1 h-px bg-[#1e2d3d]" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com.au"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full bg-[#111c2a] border border-[#1e2d3d] text-white placeholder-[#4a6070] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/20 transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-1.5">
                  Password
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
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-[#00C896] hover:text-[#00b386] transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full py-3 rounded-xl font-semibold text-sm text-black active:scale-[0.98] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                style={{ background: '#00C896' }}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  'Sign in'
                )}
              </button>
            </form>
          </div>

          {/* Sign up link */}
          <p className="mt-5 text-sm text-[#8b949e]">
            Don't have an account?{' '}
            <Link
              href="/sign-up"
              className="text-white font-bold hover:text-[#00C896] transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
